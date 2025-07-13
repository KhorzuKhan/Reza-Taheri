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

export function sanierung_renovierung(zustand, inspection, kante, BAA_AB, BAC_AC, BAD_CD, BAH_A,BAJ_BC, BBE_GH, BAF_I)
{
    let san_ren = {}  // sanierungsmassnahmen für Reparatur
    let lvz_flag_11 = true
    let lvz_flag_13 = true
    let lvz_flag_14 = true
    let lvz_flag_15 = true
    let lvz_flag_18 = true
    let lvz_flag_22 = true

    const kurzliner_lvz=[14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9]
    const laenge_kurzline=[1, 1.5, 2, 2.5, 3, 3.5, 4]
    const teilerneuerung_lvz=[16.1, 16.2, 16.3, 16.4, 16.5, 16.6]
    const tiefe_teil=[1, 2, 3, 4, 5, 6]
    
    const user = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === "Renovierung")
    const renovierung = user.benoetigte_arbeiten
    // allgemeine Baustelleneinrichtung für jede Kante
    let mengen = [] //empty
    let von = get(zustand[0].station) // Anfang der Kante
    let bis = get(kante.haltungslaenge)
    let umfang_von = ""
    let umfang_bis =""
    let laenge = get(kante.haltungslaenge)
    let klasse = 1 //unknown so far
    let lvzs = [] //empty
    let gesamt_haltung = []
    if(inspection.sanierung_haltung == "erforderlich" && inspection.inspektion_aelter_3J == "ja")
    {
        mengen = [1, 2, 1, 2, 1, 1]
        lvzs = ["2.1", "2.2", "3.1", "3.2", "3.8", "5.1"]
        for(let i=0; i<6; i++)
        { 
            gesamt_haltung = {grund: "allgemeine Baustelleneinrichtung",menge: mengen[i], station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz: lvzs[i]}
            renovierung.push(gesamt_haltung)
        }           
    }else if( inspection.sanierung_haltung == "erforderlich" && inspection.inspektion_aelter_3J == "nein")
    {
        mengen = [1, 2, 1, 1, 1]
        lvzs = ["2.1", "2.2", "3.1", "3.2", "5.1"]
        for(let i=0; i<5; i++)
        {
            gesamt_haltung = {grund: "allgemeine Baustelleneinrichtung", menge: mengen[i], station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz: lvzs[i]}
            renovierung.push(gesamt_haltung)
        }
    }
    //Schlauchlining
    if(inspection.sanierung_haltung == "erforderlich")
    {
        gesamt_haltung = {grund: "Schlauchlining",menge: 1, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz: "31.1"}
        renovierung.push(gesamt_haltung)
        gesamt_haltung = {grund: "Schlauchlining",menge: 1, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz: "31.2"}
        renovierung.push(gesamt_haltung)
    }
/*--------------------------------------------------------------------------------------------------------------------------------------------*/  
        for( const element of zustand)
        {
            if( element.sanierung_schaden == "erforderlich")
            {
                let allow = true
                //sanierung_reparatur(element, kante)
                if(element.streckenschaden?.value.includes("A") || get(element.streckenschaden) == null)
                {
                    // ignoring BAH Z when it comes with other codes
                    for(let i=0; i<zustand.length; i++)
                    {
                        if(get(zustand[i].kode)=="BAH" && (get(zustand[i].charakterisierung_1) =="E" || get(zustand[i].charakterisierung_1)=="Z" ))
                        {
                            const BAH_station = get(zustand[i].station)
                            for(let j=0; j<zustand.length; j++)
                            {
                                if((i != j) && (get(zustand[j].station) == BAH_station))
                                {
                                    zustand[i].ignore = "ja"
                                }
                            }
                        }
                    }
                    let menge = 1 //default value
                    von = get(element.station)
                    bis = get(element.station)
                    umfang_von = get(element.lage_umfang_von)
                    umfang_bis = get(element.lage_umfang_bis)
                    laenge = 0.3 //default value 
                    let lvz = "" //unknown so far
                    let bauweise = "geschlossen" //default value
                    let m=0
                    if(umfang_von>umfang_bis)
                    {
                       m = 12 + (umfang_bis - umfang_von) //Bspl. von:11 Uhr bis 4 Uhr--> m = 12 + 4 - 11 = 5
                    }
                    if(umfang_von<umfang_bis)
                    {
                       m = umfang_bis - umfang_von //Bspl. von:5 Uhr bis 10 Uhr--> m = 10 - 5 = 5
                    }
                    let Umfang_Area = (3.1416*m*Number(get(kante.profil.profilbreite))/1000/12).toFixed(2) // calculationg length of the damage based on the clock footage [m] 
                    
                    let KodeCh1 = get(element.kode)
                    const notimportant = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Z"]
                    const notallowed = ["BAB","BAK","BAL","BAM","BBA","BBC","BBD","BBF","BDE", "BAI"]
                    if(check_true(notimportant, get(element.charakterisierung_1)) && check_true(notallowed, get(element.kode))== false)
                    {
                        KodeCh1 = get(element.kode)+" "+get(element.charakterisierung_1)
                    }

                    if( get(element.streckenschaden) != null)
                    {
                        bis = element.endstation
                        laenge = Math.round((bis - von)*100)/100
                    }
                    if(bis == null)
                    {
                        bis = 0.3
                        laenge = 0.3
                    }
                    // Reparatur Kode: BAA
                    if(get(element.kode)=="BAA" && element.klassifizierung_dwa.schadensklasse_gesamt <= BAA_AB)
                    {
                        bauweise="offen"
                        if(get(kante.mittlere_tiefe)>=tiefe_teil[5])
                        {
                            san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse: 2, lvz: "16.6", bauweise}
                            renovierung.push(san_ren) 
                            
                        }else
                        {
                            for (let i=0; i<6; i++)
                            {
                                if(get(kante.mittlere_tiefe)<tiefe_teil[i])
                                {
                                    if(allow)
                                    {
                                        if(laenge == 0.3) // in case it is punktschade or StreckenS smaller than 2m
                                        {
                                            laenge = 2
                                            von -= 1
                                            bis = von + 2
                                        }else if (laenge != 0.3 && laenge<2)
                                        {
                                            const aaa = Math.round(((2 - laenge)/2)*10)/10
                                            laenge = 2
                                            von -= aaa
                                            bis = von + 2
                                        }
                                        if(von < 0.5)
                                        {
                                            von = 0.05
                                        }
                                        if(bis > get(kante.haltungslaenge)-0.5)
                                        {
                                            bis = get(kante.haltungslaenge)
                                        }
                                        san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse, lvz: teilerneuerung_lvz[i], bauweise}
                                        renovierung.push(san_ren)
                                        allow=false
                                    }
                                }  
                            }
                        }
                        continue
                    }
                    // Reparatur Kode: BAC
                    if(get(element.kode) == "BAC")
                    {
                        if((get(element.charakterisierung_1)=="A" || get(element.charakterisierung_1)=="C" && element.klassifizierung_dwa.schadensklasse_gesamt <= BAC_AC) || laenge>0.8)
                        {
                            bauweise="offen"
                            if(get(kante.mittlere_tiefe)>=tiefe_teil[5])
                            {
                                san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse: 2, lvz: "16.6", bauweise}
                                renovierung.push(san_ren) 
                                
                            }else
                            {
                                for (let i=0; i<6; i++)
                                {
                                    if(get(kante.mittlere_tiefe)<tiefe_teil[i])
                                    {
                                        if(allow)
                                        {
                                            if(laenge == 0.3) // in case it is punktschade or StreckenS smaller than 2m
                                            {
                                                laenge = 2
                                                von -= 1
                                                bis = von + 2
                                            }else if (laenge != 0.3 && laenge<2)
                                            {
                                                const aaa = Math.round(((2 - laenge)/2)*10)/10
                                                laenge = 2
                                                von -= aaa
                                                bis = von + 2
                                            }
                                            if(von < 0.5)
                                            {
                                                von = 0.05
                                            }
                                            if(bis > get(kante.haltungslaenge)-0.5)
                                            {
                                                bis = get(kante.haltungslaenge)
                                            }
                                            san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse, lvz: teilerneuerung_lvz[i], bauweise}
                                            renovierung.push(san_ren)
                                            allow=false
                                        }
                                    }  
                                }
                            }
                        }else
                        {
                            if(Number(get(kante.profil.profilbreite)) < 800)
                            {
                                lvz="15.1"
                                if(lvz_flag_15)
                                {
                                    san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                    renovierung.push(san_ren)
                                }
                                lvz_flag_15=false
                                lvz="15.5"
                                san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                                renovierung.push(san_ren)
                            }else
                            {
                                lvz="18.1"
                                if(lvz_flag_18)
                                {
                                    san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                    renovierung.push(san_ren)
                                }
                                lvz_flag_18=false
                                lvz="18.7"
                                menge=3
                                san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                                renovierung.push(san_ren)
                            }
                        }
                    continue    
                    }
                    // Reparatur Kode: BAD
                    if(get(element.kode)=="BAD")
                    {
                        if((get(element.charakterisierung_1)=="C" || get(element.charakterisierung_1)=="D" && element.klassifizierung_dwa.schadensklasse_gesamt <= BAD_CD) || (laenge>0.8 && get(element.charakterisierung_1) == "B"))
                        {
                            bauweise="offen"
                            if(get(kante.mittlere_tiefe)>=tiefe_teil[5])
                                {
                                    san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse: 2, lvz: "16.6", bauweise}
                                    renovierung.push(san_ren) 
                                    
                                }else
                                {
                                    for (let i=0; i<6; i++)
                                    {
                                    if(get(kante.mittlere_tiefe)<tiefe_teil[i])
                                        {
                                            if(allow)
                                            {
                                                if(laenge == 0.3) // in case it is punktschade or StreckenS smaller than 2m
                                                {
                                                    laenge = 2
                                                    von -= 1
                                                    bis = von + 2
                                                }else if (laenge != 0.3 && laenge<2)
                                                {
                                                    const aaa = Math.round(((2 - laenge)/2)*10)/10
                                                    laenge = 2
                                                    von -= aaa
                                                    bis = von + 2
                                                }
                                                if(von < 0.5)
                                                {
                                                    von = 0.05
                                                }
                                                if(bis > get(kante.haltungslaenge)-0.5)
                                                {
                                                    bis = get(kante.haltungslaenge)
                                                }
                                                san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse, lvz: teilerneuerung_lvz[i], bauweise}
                                                renovierung.push(san_ren)
                                                allow=false
                                            }
                                        }  
                                    }
                                }
                        }else if(get(element.charakterisierung_1)=="A")
                        {
                            lvz="Ingenieurmaessige Begutachtung"
                            menge=""
                            bauweise=""
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }else
                        {
                            if(Number(get(kante.profil.profilbreite)) < 800)
                            {
                                lvz="15.1"
                                if(lvz_flag_15)
                                {
                                    san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                    renovierung.push(san_ren)
                                }
                                lvz_flag_15=false
                                lvz="15.5"
                                san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                                renovierung.push(san_ren)
                            }else
                            {
                                lvz="18.1"
                                if(lvz_flag_18)
                                {
                                    san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                    renovierung.push(san_ren)
                                }
                                lvz_flag_18=false
                                lvz="18.8"
                                menge=3
                                san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                                renovierung.push(san_ren)
                                continue
                            }  
                        }
                    continue
                    }
                    // Reparatur Kode: BAM, BAN, BBD, BBG, BDE
                    const ingenieur_begut=["BAM","BAN","BBD","BBG","BDE"]
                    if(check_true(ingenieur_begut, get(element.kode)))
                    {
                        lvz="Ingenieurmaessige Begutachtung"
                        menge=""
                        bauweise=""
                        san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                        renovierung.push(san_ren)
                    continue
                    }
                    // Reparatur Kode: BAF
                    const BAF_CH11 = ["F", "H", "G"]
                    if(get(element.kode)=="BAF" && check_true(BAF_CH11, get(element.charakterisierung_1)))
                    {
                        if(get(element.streckenschaden) == null && Number(get(kante.profil.profilbreite))<800)
                        {
                            lvz = "11.1"
                            if(lvz_flag_11)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_11 = false
                            lvz = "11.2"
                            menge=0.5
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                            lvz = "11.7"
                            menge=1
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        } else if(get(element.streckenschaden) == null && Number(get(kante.profil.profilbreite))>=800)
                        {
                            lvz="18.1"
                            if(lvz_flag_18)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_18=false
                            if(get(element.charakterisierung_1)=="H" || get(element.charakterisierung_1)=="G")
                            {
                                lvz="18.2"
                                menge=0.5
                                san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                                renovierung.push(san_ren)  
                            }
                            lvz="18.7"
                            menge=3
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        } else if(get(element.streckenschaden) != null)
                        {
                            lvz="Ingenieurmaessige Begutachtung"
                            menge=""
                            bauweise=""
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }
                    continue
                    }
                    const BAF_CH111=["J", "K", "Z"]
                    if(get(element.kode)=="BAF" && check_true(BAF_CH111, get(element.charakterisierung_1)))
                    {
                        lvz="Ingenieurmaessige Begutachtung"
                        menge=""
                        bauweise=""
                        san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                        renovierung.push(san_ren)
                        
                    } else if(get(element.kode)=="BAF" && get(element.charakterisierung_1)=="I" && element.klassifizierung_dwa.schadensklasse_gesamt <= BAF_I)
                    {
                        bauweise="offen"
                        if(get(kante.mittlere_tiefe)>=tiefe_teil[5])
                        {
                            san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse: 2, lvz: "16.6", bauweise}
                            renovierung.push(san_ren)
                        }else
                        { 
                            for (let i=0; i<6; i++)
                            {
                                if(get(kante.mittlere_tiefe)<tiefe_teil[i])
                                {
                                    if(allow)
                                    {
                                        if(laenge == 0.3) // in case it is punktschade or StreckenS smaller than 2m
                                        {
                                            laenge = 2
                                            von -= 1
                                            bis = von + 2
                                        }else if (laenge != 0.3 && laenge<2)
                                        {
                                            const aaa = Math.round(((2 - laenge)/2)*10)/10
                                            laenge = 2
                                            von -= aaa
                                            bis = von + 2
                                        }
                                        if(von < 0.5)
                                        {
                                            von = 0.05
                                        }
                                        if(bis > get(kante.haltungslaenge)-0.5)
                                        {
                                            bis = get(kante.haltungslaenge)
                                        }
                                        san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse, lvz: teilerneuerung_lvz[i], bauweise}
                                        renovierung.push(san_ren)
                                        allow=false
                                    }
                                }  
                            }
                        }
                    continue                    
                    }
                    const BAF_CH=["D","E"]
                    if(get(element.kode)=="BAF" && check_true(BAF_CH, get(element.charakterisierung_1)))
                    {
                        if(Number(get(kante.profil.profilbreite))<800)
                        {
                            lvz="14.1"
                            if(lvz_flag_14)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_14=false
                            if(laenge>=laenge_kurzline[6])
                            {
                                san_ren={grund: KodeCh1, menge: Math.ceil(laenge/4), station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz: "14.9", bauweise}
                                renovierung.push(san_ren)
                            }else
                            {
                                for (let i = 0; i<7; i++)
                                {
                                    if(laenge<laenge_kurzline[i])
                                    {
                                        if(allow)
                                        {
                                            san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge:laenge_kurzline[i], klasse, lvz: kurzliner_lvz[i], bauweise}
                                            renovierung.push(san_ren)
                                            allow=false
                                        }   
                                    }
                                }
                            }
                        }else
                        {
                            lvz="13.1"
                            if(lvz_flag_13)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_13=false        
                            if(Number(get(kante.profil.profilbreite)) == 800)
                            {
                                lvz="13.2"
                            }else
                            {
                                lvz="13.4"
                            }
                            if(get(element.streckenschaden)!=null)
                                {
                                    menge = Math.ceil(laenge/0.3)
                                }
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }
                        continue
                    }
                    // Reparatur Kode: BAG
                    if(get(element.kode)=="BAG")
                    {
                        if(Number(get(kante.profil.profilbreite))<800)
                        {
                            lvz="11.1"
                            if(lvz_flag_11)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)   
                            }
                            lvz_flag_11 = false
                            lvz = "11.2"
                            menge = 0.5
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }else
                        {
                            lvz="18.1"
                            if(lvz_flag_18)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)   
                            }
                            lvz_flag_18 = false
                            lvz = "18.2"
                            menge = 0.5
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }
                        continue
                    }
                    // Reparatur Kode: BAH
                    if(get(element.kode)=="BAH" && (get(element.charakterisierung_1) =="E" || get(element.charakterisierung_1)=="Z" ))
                    {
                        if(element.ignore !="ja")
                        {
                            lvz="Ingenieurmaessige Begutachtung"
                            menge=""
                            bauweise=""
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }
                    }
                    else if(get(element.kode)== "BAH" && get(element.charakterisierung_1) =="D")
                    {
                        if(Number(get(kante.profil.profilbreite))>=800)
                        {
                            lvz = "18.1"
                            if(lvz_flag_18)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_18=false
                            lvz = "18.2"
                            menge=0.5
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            lvz = "18.7"
                            menge=1
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }else
                        {
                            lvz = "15.1"
                            if(lvz_flag_15)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_15=false
                            lvz = "15.6"
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }
                        continue
                    }else if(get(element.kode)=="BAH" && get(element.charakterisierung_1) =="A" && element.klassifizierung_dwa.schadensklasse_gesamt <= BAH_A)
                    {
                        bauweise="offen"
                        if(get(kante.mittlere_tiefe)>=tiefe_teil[5])
                            {
                                san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse: 2, lvz: "16.6", bauweise}
                                renovierung.push(san_ren) 
                                
                            }else
                            {
                                for (let i=0; i<6; i++)
                                {
                                if(get(kante.mittlere_tiefe)<tiefe_teil[i])
                                    {
                                        if(allow)
                                        {
                                            if(laenge == 0.3) // in case it is punktschade or StreckenS smaller than 2m
                                            {
                                                laenge = 2
                                                von -= 1
                                                bis = von + 2
                                            }else if (laenge != 0.3 && laenge<2)
                                            {
                                                const aaa = Math.round(((2 - laenge)/2)*10)/10
                                                laenge = 2
                                                von -= aaa
                                                bis = von + 2
                                            }
                                            if(von < 0.5)
                                            {
                                                von = 0.05
                                            }
                                            if(bis > get(kante.haltungslaenge)-0.5)
                                            {
                                                bis = get(kante.haltungslaenge)
                                            }
                                            san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse, lvz: teilerneuerung_lvz[i], bauweise}
                                            renovierung.push(san_ren)
                                            allow=false
                                        }
                                    }  
                                }
                            }
                        continue
                    }
                    // Reparatur Kode: BAI
                    if(get(element.kode)=="BAI")
                    {
                        menge = 1
                        if(Number(get(kante.profil.profilbreite))<800)
                        {
                            lvz = "11.1"
                            if(lvz_flag_11)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_11=false
                            lvz = "11.2"
                            menge=0.5
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren) 
                        }
                        else
                        {
                            lvz = "18.1"
                            if(lvz_flag_18)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_18=false
                            lvz = "18.5"
                            san_ren = {grund: KodeCh1, menge: Umfang_Area, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }
                        continue
                    }
                    // Reparatur Kode: BAJ
                    if(get(element.kode)=="BAJ")
                    {   if ((get(element.charakterisierung_1)=="C" || get(element.charakterisierung_1)=="B") && element.klassifizierung_dwa.schadensklasse_gesamt <= BAJ_BC)
                        {
                            bauweise="offen"
                            if(get(kante.mittlere_tiefe)>=tiefe_teil[5])
                                {
                                    san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse: 2, lvz: "16.6", bauweise}
                                    renovierung.push(san_ren) 
                                    
                                }else
                                {
                                    for (let i=0; i<6; i++)
                                    {
                                    if(get(kante.mittlere_tiefe)<tiefe_teil[i])
                                        {
                                            if(allow)
                                                {
                                                    if(laenge == 0.3) // in case it is punktschade or StreckenS smaller than 2m
                                                    {
                                                        laenge = 2
                                                        von -= 1
                                                        bis = von + 2
                                                    }else if (laenge != 0.3 && laenge<2)
                                                    {
                                                        const aaa = Math.round(((2 - laenge)/2)*10)/10
                                                        laenge = 2
                                                        von -= aaa
                                                        bis = von + 2
                                                    }
                                                    if(von < 0.5)
                                                    {
                                                        von = 0.05
                                                    }
                                                    if(bis > get(kante.haltungslaenge)-0.5)
                                                    {
                                                        bis = get(kante.haltungslaenge)
                                                    }
                                                    san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse, lvz: teilerneuerung_lvz[i], bauweise}
                                                    renovierung.push(san_ren)
                                                    allow=false
                                                }
                                        }  
                                    }
                                }
                            continue 
                        }else if (get(element.charakterisierung_1)=="B" && element.klassifizierung_dwa.schadensklasse_gesamt > BAJ_BC)
                        {
                            if(Number(get(kante.profil.profilbreite))<800)
                            {
                                bauweise="geschlossen"
                                lvz = "11.1"
                                if(lvz_flag_11)
                                {
                                    san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                    renovierung.push(san_ren)
                                }
                                lvz_flag_11=false
                                lvz = "11.2"
                                menge = 0.5
                                san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                                renovierung.push(san_ren)
                                continue
                            }else
                            {
                                bauweise="geschlossen"
                                lvz = "18.1"
                                if(lvz_flag_18)
                                {
                                    san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                    renovierung.push(san_ren)
                                }
                                lvz_flag_18=false
                                lvz = "18.2"
                                menge = 1
                                san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                                renovierung.push(san_ren)
                                continue
                            }
                        }else if (get(element.charakterisierung_1)=="C" && element.klassifizierung_dwa.schadensklasse_gesamt > BAJ_BC)
                        {
                            if(Number(get(kante.profil.profilbreite))<800)
                            {
                                lvz = "14.1"
                                menge = 1
                                if(lvz_flag_14)
                                {
                                    san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                    renovierung.push(san_ren)
                                }
                                lvz_flag_14=false
                                if(get(element.streckenschaden)==null)
                                {
                                    lvz = "14.2"
                                    san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                                    renovierung.push(san_ren)
                                }else
                                {
                                    if(laenge>=laenge_kurzline[6])
                                    {
                                        if(allow)
                                            {
                                                san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse, lvz: kurzliner_lvz[i], bauweise}
                                                renovierung.push(san_ren)
                                                allow=false
                                            }  
                                    }else
                                    {
                                        for (let i = 0; i<7; i++)
                                        {
                                            if(laenge<laenge_kurzline[i])
                                            {
                                                if(allow)
                                                {
                                                    san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge:laenge_kurzline[i], klasse, lvz: kurzliner_lvz[i], bauweise}
                                                    renovierung.push(san_ren)
                                                    allow=false
                                                }
                                            }
                                        }
                                    }
                                }
                            }else
                            {
                                lvz = "13.1"
                                if(lvz_flag_13)
                                {
                                    san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                    renovierung.push(san_ren)
                                }
                                lvz_flag_13=false
                                if(Number(get(kante.profil.profilbreite)) == 800)
                                {
                                    lvz="13.2"
                                }else
                                {
                                    lvz="13.4"
                                }
                                if(get(element.streckenschaden)!=null)
                                {
                                    menge = Math.ceil(laenge/0.3)
                                }
                                san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                                renovierung.push(san_ren)
                            }
                        }
                    continue
                    }
                    // Reparatur Kode: BAK
                    if(get(element.kode)=="BAK")
                    {
                        if(laenge>2)
                        {
                            lvz="Ingenieurmaessige Begutachtung"
                            menge=""
                            bauweise=""
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }else
                        {
                            if(Number(get(kante.profil.profilbreite))<800)
                            {
                                lvz = "11.1"
                                if(lvz_flag_11)
                                {
                                    san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                    renovierung.push(san_ren)
                                }
                                lvz_flag_11=false
                                lvz = "11.2"
                                menge = 0.5
                                san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                                renovierung.push(san_ren)
                            }else
                            {
                                lvz = "18.1"
                                if(lvz_flag_18)
                                {
                                    san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                    renovierung.push(san_ren)
                                }
                                lvz_flag_18=false
                                lvz = "18.2"
                                menge = 1
                                san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                                renovierung.push(san_ren)
                            }
                        }
                        continue
                    }
                    // Reparatur Kode: BAL
                    if(get(element.kode)=="BAL")
                    {
                        if(Number(get(kante.profil.profilbreite))<800)
                        {
                            lvz = "11.1"
                            if(lvz_flag_11)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_11=false
                            lvz = "11.2"
                            menge = 0.75
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }else
                        {
                            lvz = "18.1"
                            if(lvz_flag_18)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_18=false
                            lvz = "18.2"
                            menge = 1
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }
                        continue
                    }
                    // Reparatur Kode: BAO

                    // Reparatur Kode: BAP

                    // Reparatur Kode: BBA
                    if(get(element.kode)=="BBA")
                    {
                        if(Number(get(kante.profil.profilbreite))<800)
                        {
                            lvz = "11.1"
                            if(lvz_flag_11)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_11=false
                            lvz = "11.2"
                            if(get(element.streckenschaden)==null)
                            {
                                menge = 0.5
                            }else
                            {
                                menge = 0.25*(Math.floor(laenge)+2) // for L<1 : 0.5h for every 1 meter, 0.25h added up
                            }
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }else
                        {
                            lvz = "18.1"
                            if(lvz_flag_18)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_18=false
                            lvz = "18.2"
                            if(get(element.streckenschaden)==null)
                            {
                                menge = 0.75   
                            }else
                            {
                                menge = 0.5*(Math.floor(laenge)+1.5) // for L<1 : 0.75h for every 1 meter, 0.5h added up
                            }
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }
                        continue
                    }
                    // Reparatur Kode: BBB
                    if(get(element.kode)=="BBB" && get(element.charakterisierung_1)=="A")
                    {
                        if(Number(get(kante.profil.profilbreite))<800)
                        {
                            menge = 1
                            lvz = "11.1"
                            if(lvz_flag_11)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_11=false
                            lvz = "11.2"
                            if(get(element.streckenschaden)==null)
                            {
                                menge = 0.5
                            }else
                            {
                                menge = 0.25*(Math.floor(laenge)+2) // for L<1 : 0.5h for every 1 meter, 0.25h added up
                            }
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }else
                        {
                            lvz = "18.1"
                            if(lvz_flag_18)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_18=false
                            lvz = "18.2"
                            if(get(element.streckenschaden)==null)
                            {
                                menge = 0.75   
                            }else
                            {
                                menge = 0.5*(Math.floor(laenge) + 1.5) // for L<1 : 0.75h for every 1 meter, 0.5h added up
                            }
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }
                        continue
                    }
                    // reparatur Kode: BBE
                    const BBE_CH1 =["D","E","F","Z"]
                    const BBE_CH11 =["G","H"]
                    if(get(element.kode)=="BBE" && check_true(BBE_CH1, get(element.charakterisierung_1)))
                    {
                        lvz="Ingenieurmaessige Begutachtung"
                        menge=""
                        bauweise=""
                        san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                        renovierung.push(san_ren)
                        continue
                    }else if(get(element.kode)=="BBE" && check_true(BBE_CH11, get(element.charakterisierung_1)) && element.klassifizierung_dwa.schadensklasse_gesamt <= BBE_GH)
                    {
                        bauweise="offen"
                        if(get(kante.mittlere_tiefe)>=tiefe_teil[5]) 
                        {
                            san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse: 2, lvz: "16.6", bauweise}
                            renovierung.push(san_ren) 
                            
                        }else
                        {
                            for (let i=0; i<6; i++)
                            {
                                if(get(kante.mittlere_tiefe)<tiefe_teil[i])
                                {
                                    if(allow)
                                    {
                                        if(laenge == 0.3) // in case it is punktschade or StreckenS smaller than 2m
                                        {
                                            laenge = 2
                                            von -= 1
                                            bis = von + 2
                                        }else if (laenge != 0.3 && laenge<2)
                                        {
                                            const aaa = Math.round(((2 - laenge)/2)*10)/10
                                            laenge = 2
                                            von -= aaa
                                            bis = von + 2
                                        }
                                        if(von < 0.5)
                                        {
                                            von = 0.05
                                        }
                                        if(bis > get(kante.haltungslaenge)-0.5)
                                        {
                                            bis = get(kante.haltungslaenge)
                                        }
                                        san_ren={grund: KodeCh1, menge, station_von: von, station_bis: bis, laenge, klasse, lvz: teilerneuerung_lvz[i], bauweise}
                                        renovierung.push(san_ren)
                                        allow=false
                                    }
                                }  
                            }
                        }
                    }
                    // Reparatur Kode: BBF
                    if(get(element.kode)=="BBF")
                    {
                        if(Number(get(kante.profil.profilbreite))<800)
                        {
                            lvz="15.1"
                            if(lvz_flag_15)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_15=false
                            lvz="15.5"
                            san_ren = {grund: KodeCh1, menge, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }else
                        {
                            lvz = "22.1"
                            if(lvz_flag_22)
                            {
                                san_ren = {grund: KodeCh1, station_von: von, station_bis: bis, menge, laenge, klasse, lvz}
                                renovierung.push(san_ren)
                            }
                            lvz_flag_22 = false
                            lvz = "22.4"
                            san_ren = {grund: KodeCh1, menge: Umfang_Area, station_von: von, station_bis: bis, lage_umfang_von: umfang_von, lage_umfang_bis: umfang_bis, laenge, klasse, lvz, bauweise}
                            renovierung.push(san_ren)
                        }
                    }
                }
            }
        }
}