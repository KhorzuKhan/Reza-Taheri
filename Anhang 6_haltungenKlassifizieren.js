import Api from "../api.js"
import { sanierung_reparatur } from "./sanierung_reparatur.js"
import { sanierung_renovierung } from "./sanierung_renovierung.js"
import { sanierung_erneuerung } from "./sanierung_erneuerung.js"
import { dupliziert_remover } from "./dupliziert_remover.js"
import { getLVZValue} from "../lvz_utilitys.js"
import { DKV } from "./DKV.js"
import { kosten_ermittlung } from "./kosten_ermittlung.js"
import { transformer } from "./transformer.js"
import { abbruch_system } from "./abbruch_system.js"
import { SubKanS } from "./SubKanS.js"
/**
 * Extracts the Primitive value of a Value Object. If the input is already a Primitive, 
 * no action is performed
 * @param {Number | String | Value} value 
 * @param {Number | String} default_value Optional - if given undefined values will be replace with the given default
 * @returns {Number | String}
 */
function get(value, default_value = undefined)
{
    if (typeof value !== 'object')
        return value ?? default_value

    return value?.value ?? default_value
}
function check_true(list_of_data, item)
{
    for(const element of list_of_data)
    {
        if(element == item)
        {
            return true
        }
    }
    return false
}
export async function haltungenKlassifizieren(settings)
{
    /**
     * @type {Api}
     */
    const api = window.api_instance

    const lv = await api.getLVZ()
    //iterate over all edges in the Projectfile
    for await (const kante of api.getAllKanten())
    {
        schaedenKlassifizieren(kante, lv, settings)
        //save changes to the edge in the project file
        await api.setKante(kante)
    }
}
/**
 * @param {import("../api.js").Kante} kante 
 */
let OldInspektion = 0
let TotalInspektion = 0
let KanteCounter = 0
let sonderprofil = 0
let listofsys = []
let inspekNr = 0
let listofprofil = {K:0, E:0, R:0, M:0, KK:0, EE:0, RR:0, MM:0}
let DNcheck = 10
let MTcheck = 1
let errorliste_REP = []
let errorliste_REN = []
let errorliste_ERN = []
let duplikat = []
let duplikat_S = []
let bevorzugte_masnahmen = []
let kante_kosten_tabelle = []
let kante_kosten_tabelle_DKV = []
function schaedenKlassifizieren(kante, lv, settings)
{
    KanteCounter += 1
    let kreisprofil = true
    let kodierungEU = true
    // region Profilart Analyse
    // counting Sonderprofile
    if(get(kante.profil.profilart) !="K")
    {
        sonderprofil += 1
        kreisprofil = false
    }
    if(get(kante.profil.profilart) =="R") // ich betrachte Rechteckprofil als Kreisprofil mit Durchmesser: Breite
    {
        kreisprofil = true
    }
    // counting types of pipes all Norms
    const runner = get(kante.profil.profilart)
    if(runner == "K")
    {
        listofprofil.KK += 1
    }else if(runner == "E")
    {
       listofprofil.EE += 1
    }else if(runner == "R")
    {
        listofprofil.RR += 1
    }else if(runner == "M")
    {
        listofprofil.MM += 1
    }

    if(kante.inspectionen != null)
    {
        inspekNr += 1
    }
    for(const inspection of (kante.inspectionen || []))
    {
        // counting types of pipes only EU Norms
        if(runner == "K" && get(inspection.kodiersystem).includes("DWA-M 149"))
        {
            listofprofil.K += 1
        }else if(runner == "E" && get(inspection.kodiersystem).includes("DWA-M 149"))
        {
            listofprofil.E += 1
        }else if(runner == "R" && get(inspection.kodiersystem).includes("DWA-M 149"))
        {
            listofprofil.R += 1
        }else if(runner == "M" && get(inspection.kodiersystem).includes("DWA-M 149"))
        {
            listofprofil.M += 1
        }

        const ins_kode = get(inspection.kodiersystem)
        if(!check_true(listofsys, ins_kode))
        {
            listofsys.push(ins_kode)
        }
        // counting the old german coding system
        if(!get(inspection.kodiersystem).includes("DWA-M 149"))
        {
            OldInspektion += 1
            kodierungEU = false
        }
        if(get(inspection.kodiersystem) != null)        
        {
            TotalInspektion += 1
        }
        if(kodierungEU && kreisprofil)
        {
            const zustand = inspection.zustand
            for( const element of zustand)
            {
                element.klassifizierung_dwa = { schadensklasse_standsicherheit: get(element.additional_data.HZ971),
                                                schadensklasse_betriebssicherheit: get(element.additional_data.HZ972),
                                                schadensklasse_dichtheit:  get(element.additional_data.HZ973),
                                                schadensklasse_gesamt: get(element.additional_data.HZ970)
                }
                element.klassifizierung_isybau = {  schadensklasse_standsicherheit: get(element.additional_data.HZ961),
                                                    schadensklasse_betriebssicherheit: get(element.additional_data.HZ962),
                                                    schadensklasse_dichtheit:  get(element.additional_data.HZ963),
                                                    schadensklasse_gesamt: get(element.additional_data.HZ960)
                }
            }
            inspection.klassifizierung_dwa = {  zustandsklasse_standsicherheit: get(inspection.additional_data.HI971),
                                                zustandsklasse_betriebssicherheit: get(inspection.additional_data.HI972),
                                                zustandsklasse_dichtheit:  get(inspection.additional_data.HI973),
                                                zustandsklasse_gesamt: get(inspection.additional_data.HI970),
                                                abnutzung: get(inspection.additional_data.HI888),
                                                substanzklasse: get(inspection.additional_data.HI889)
            }
            inspection.klassifizierung_isybau = {   zustandsklasse_standsicherheit: get(inspection.additional_data.HI961),
                                                    zustandsklasse_betriebssicherheit: get(inspection.additional_data.HI962),
                                                    zustandsklasse_dichtheit:  get(inspection.additional_data.HI963),
                                                    zustandsklasse_gesamt: get(inspection.additional_data.HI960)
            }
            //region Preprocessing
            // Die Koden, wofür keine Maßnahme entgegenzunehmen sind
            let InfoKode = ["BCA", "BCB", "BCC", "BCD", "BCE", "BDA", "BDB", "BDC", "BDD", "BDE", "BDF", "BDG"]
            /*
            BCA: Anschluss, BCB: Punktuelle Reparatur, BCD: Anfangsknoten; BCE: Endknoten; BDA: Allgemeines Foto
            BDB: Allgemeine Anmerkung, BDC: Inspektion endet vor dem Endknoten, BDD: Wasserspiegel
            BDE: Zufluss aus einem Anschluss, BDF: Atmosphäre in der Leitung, BDG: Keine Sicht
            */
    
            for (const element of zustand)
            {
                if(check_true(InfoKode, get(element.kode)))
                {
                    element.sanierung_schaden = "keine Massnahmen"   
                }
            }

            const ZK_gesamt_DWA = inspection.klassifizierung_dwa.zustandsklasse_gesamt
            const ZK_von = settings.sanierung_analyse.zustandsklasse_von
            const ZK_bis = settings.sanierung_analyse.zustandsklasse_bis
            const EZK_von = settings.sanierung_analyse.einzelschadenklasse_von
            const EZK_bis = settings.sanierung_analyse.einzelschadenklasse_bis
            if(Number(ZK_gesamt_DWA) < Number(ZK_von) || Number(ZK_gesamt_DWA) > Number(ZK_bis))
            {
                inspection.sanierung_haltung = "nicht erforderlich"
                for( const element of zustand)
                {
                    element.sanierung_schaden = "nicht erforderlich"
                }
            }
            else
            {
                inspection.sanierung_haltung = "erforderlich"
                for( const element of zustand)
                {
                    if(element.sanierung_schaden != "keine Massnahmen")
                    {
                        const EZK_gesamt_DWA = element.klassifizierung_dwa.schadensklasse_gesamt
                        if(Number(EZK_gesamt_DWA) < Number(EZK_von) || Number(EZK_gesamt_DWA) > Number(EZK_bis))
                        {
                            element.sanierung_schaden = "nicht erforderlich"
                        }
                        else
                        {
                            element.sanierung_schaden = "erforderlich"
                        }
                    }
                }
            }
/*---------------------------------------------------------------------------------------------------------------------------*/       
            // Zahl_der_Kante for inspections older than 3a
            const inputDate = new Date(get(inspection.inspektionsdatum))
            const currentDate = new Date() // Current date
            // Calculate the date 3 years ago
            const threeYearsAgo = new Date();
            threeYearsAgo.setFullYear(currentDate.getFullYear() - 3)            
            // Compare the dates
            if (inputDate < threeYearsAgo)
            {
                inspection.inspektion_aelter_3J = "ja"
            } else 
            {
                inspection.inspektion_aelter_3J = "nein"
            }
            
            // searching for the end station of a streckenschaden.
            for( const StartPoint of zustand)
            {
                if(StartPoint.streckenschaden?.value.includes("A"))
                {
                    let startpoint_code = get(StartPoint.kode)
                    let EndStreckenSchaden = StartPoint.streckenschaden?.value.replace("A", "B")
                    for( const EndPoint of zustand)
                    {
                        if(get(EndPoint.kode) == startpoint_code && get(EndPoint.streckenschaden) == EndStreckenSchaden)
                        {
                            StartPoint.endstation = EndPoint.station
                        }
                    }
                }
            }
            // region Core
            inspection.masnahmen  = inspection.masnahmen  ??  {moegliche_masnahmen:[{name: "Reparatur", benoetigte_arbeiten: []},
                                                                                    {name: "Renovierung", benoetigte_arbeiten: []},
                                                                                    {name: "Erneuerung", benoetigte_arbeiten: []}]}
            const reparatur_abbruch = settings.abbruchkriterium.reparatur_abbruch
            const teilerneuerung_abbruch = settings.abbruchkriterium.teilerneuerung_abbruch
            const xyz = settings.kostenvergleich
            const abc = settings.offene_bauweise
            const xxx = settings.sanierungshauptverfahren
            const ABN = Number(inspection.klassifizierung_dwa.abnutzung)

            sanierung_reparatur(zustand, inspection, kante, abc.BAA_AB, abc.BAC_AC, abc.BAD_CD, abc.BAH_A,abc.BAJ_BC, abc.BBE_GH, abc.BAF_I)
            sanierung_renovierung(zustand, inspection, kante, abc.BAA_AB, abc.BAC_AC, abc.BAD_CD, abc.BAH_A,abc.BAJ_BC, abc.BBE_GH, abc.BAF_I)
            sanierung_erneuerung(zustand, inspection, kante, abc)
            dupliziert_remover(zustand, inspection, kante)
            kosten_ermittlung(lv, inspection, kante)
            DKV(inspection, xyz.nutzungsdauer_reparatur, xyz.nutzungsdauer_renovierung, xyz.nutzungsdauer_erneuerung, xyz.proz_zins, xyz.real_zins, xyz.schadenszunahme)
            abbruch_system(inspection, kante, reparatur_abbruch, teilerneuerung_abbruch)
            SubKanS(inspection, kante, ABN, Number(ZK_gesamt_DWA), Number(ZK_bis), xxx.haltungsDN, xxx.ABN_bis_HaltungsDN, xxx.ABN_ab_HaltungsDN)
            bevorzugte_masnahmen.push(`${get(kante.haltungs_name)}: ${inspection.masnahmen.empfohlene_masnahme}`)
            const shvliste = ["Reparatur", "Renovierung", "Erneuerung"]
            let costs = [0,0,0]
            let costs_DKV = [0,0,0]
            let addin = {}
            for(const shv3 of shvliste)
            {
                let sanatnaftabadan = inspection.masnahmen.moegliche_masnahmen.find(user22 => user22.name === shv3).benoetigte_arbeiten
                for(const member of sanatnaftabadan)
                {
                    if(shv3 == "Reparatur")
                    {
                        if(member.kosten != "kein Preis: ING")
                        {
                            costs[0] += member.kosten
                        }
                    }
                    if(shv3 == "Renovierung")
                    {
                        if(member.kosten != "kein Preis: ING")
                        {
                            costs[1] += member.kosten
                        }
                    }
                    if(shv3 == "Erneuerung")
                    {
                        if(member.kosten != "kein Preis: ING")
                        {
                            costs[2] += member.kosten
                        }
                    }
                }
            }
            if( inspection.sanierung_haltung == "erforderlich")
            {
                for( let i = 0 ; i<3; i++)
                {
                    const asd = Math.ceil(costs[i]*10)/10
                    costs[i] = asd
                }
                if(costs[0] == 0)
                {costs[0] = "nicht wirtschaftlich"}
                addin = {[get(kante.haltungs_name)]: costs}
                kante_kosten_tabelle.push(addin)
                costs_DKV[0] = inspection.dynamischer_KV.rep_ern
                costs_DKV[1] = inspection.dynamischer_KV.ren_ern
                costs_DKV[2] = inspection.dynamischer_KV.ern_ern
                addin = {[get(kante.haltungs_name)]: costs_DKV}
                kante_kosten_tabelle_DKV.push(addin)
            }

            //transformer(inspection)
            /*----------------------------------------------------------------------------*/
            // region Duplikat Finder
            // punktuelle Schäden
            let sanierung = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === "Reparatur").benoetigte_arbeiten
            const sth = ["2.1", "2.2", "3.1", "3.2", "3.8", "5.1","11.1", "12.1","13.1","14.1","15.1","22.1","18.1","22.1","31.1", "31.2"]
            for( let i=0; i<sanierung.length; i++)
            {
                if(check_true(sth, (sanierung[i].lvz)) == false)
                {
                    let one = true
                    const station = sanierung[i].station_von
                    for(let j=i+1; j<sanierung.length; j++)
                    {
                        if(sanierung[j].station_von == station && check_true(sth, (sanierung[j].lvz)) == false )
                        {
                            if(one)
                            {
                                duplikat.push(get(kante.haltungs_name))
                                duplikat.push(sanierung[i].grund)
                                one = false
                            }
                            duplikat.push(sanierung[j].grund)
                        }  
                    }
                    if(one == false)
                    {
                        duplikat.push("||")
                    } 
                }
            }
            // Strecken Schäden
            for(let i = 0; i<sanierung.length; i++)
            {
                const i_von = sanierung[i].station_von
                const i_bis = sanierung[i].station_bis
                if(check_true(sth, (sanierung[i].lvz)) == false)
                {
                    let one = true
                    if(i_von != i_bis)
                    {
                        for(let j=i+1; j<sanierung.length; j++)
                        {
                            const j_von = sanierung[j].station_von
                            const j_bis = sanierung[j].station_bis
                            if(check_true(sth, (sanierung[j].lvz)) == false)
                            {
                                if(j_von != j_bis && j_von>= i_von && j_von<i_bis && sanierung[i].grund != sanierung[j].grund)
                                {
                                    if(one)
                                    {
                                        duplikat_S.push(get(kante.haltungs_name))
                                        duplikat_S.push(sanierung[i].grund)
                                        one = false
                                    }
                                    duplikat_S.push(sanierung[j].grund)
                                }
                            }
                        }
                    }
                }
            }
            /*----------------------------------------------------------------------------*/
            
            //region Fehlermeldung
            let userX = inspection.masnahmen.moegliche_masnahmen.find(userX => userX.name === "Reparatur")
            for(const member of userX.benoetigte_arbeiten)
            {
                if(member.lvz == "Ingenieurmaessige Begutachtung" )
                {
                    errorliste_REP.push(`${get(kante.haltungs_name)}: ${member.grund}`)
                } 
            }
            userX = inspection.masnahmen.moegliche_masnahmen.find(userX => userX.name === "Renovierung")
            for(const member of userX.benoetigte_arbeiten)
            {
                if(member.lvz == "Ingenieurmaessige Begutachtung")
                {
                    errorliste_REN.push(`${get(kante.haltungs_name)}: ${member.grund}`)
                } 
            }
            userX = inspection.masnahmen.moegliche_masnahmen.find(userX => userX.name === "Erneuerung")
            for(const member of userX.benoetigte_arbeiten)
            {
                if(member.lvz == "Ingenieurmaessige Begutachtung")
                {
                    errorliste_ERN.push(get(kante.haltungs_name))
                } 
            }
            if(get(kante.profil.profilbreite)>DNcheck)
            {
                DNcheck = get(kante.profil.profilbreite)
            }
            if(get(kante.mittlere_tiefe)>MTcheck)
            {
                MTcheck = get(kante.mittlere_tiefe)
            }
        }
    }
    if(KanteCounter == 6037)
    {
        // const takeme = listofprofil.K+listofprofil.E+listofprofil.R+listofprofil.M
        // console.log("altes Deutsch: "+(OldInspektion*100/KanteCounter).toFixed(1)+ "%")
        // console.log("EU Normen: "+(takeme*100/KanteCounter).toFixed(1)+ "%")
        // console.log("keine Inspektion: "+(100-inspekNr*100/KanteCounter).toFixed(1)+ "%")
        // console.log(sonderprofil + " Sonderprofile")
        // console.log("***Nach EU Normen***")
        // console.log("Profilart K: " + listofprofil.K + "/" + listofprofil.KK)
        // console.log("Profilart E: " + listofprofil.E + "/" + listofprofil.EE)
        // console.log("Profilart R: " + listofprofil.R + "/" + listofprofil.RR)
        // console.log("Profilart M: " + listofprofil.M + "/" + listofprofil.MM)
        // console.log("inspizierte Kanäle: "+ inspekNr)
        // console.log("Max Durchmesser: "+ DNcheck)
        // console.log("Max mittlere_tiefe: "+ MTcheck)
        // console.log("Liste von Kodiersystem: "+ listofsys)
        console.log("Fehlermeldung in Reparatur: "+errorliste_REP)
        console.log("Fehlermeldung in Renovierung: "+errorliste_REN)
        console.log("Fehlermeldung in Erneuerung: "+errorliste_ERN)
        // console.log(duplikat)
        // console.log(duplikat_S)
        console.log(kante_kosten_tabelle)
        console.log(kante_kosten_tabelle_DKV)
        console.log(bevorzugte_masnahmen)
    }

}
