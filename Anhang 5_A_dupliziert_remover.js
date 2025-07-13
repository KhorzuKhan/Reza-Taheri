import { matrix } from "./matrix.js"
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
export function dupliziert_remover(zustand, inspection, kante)
{
    const vorarbeit = ["2.1", "2.2", "3.1", "3.2", "3.8", "5.1","11.1", "12.1","13.1","14.1","15.1","22.4","18.1","22.1","31.1", "31.2"]
    const teilerneuerung_lvz = ["16.1", "16.2", "16.3", "16.4", "16.5", "16.6"]
    const s18 = ["18.2", "18.3", "18.4", "18.5", "18.6", "18.7", "18.8", "18.9", "18.10"]
    const tiefe_teil=[1, 2, 3, 4, 5, 6]
    const kurzliner_lvz=["14.3", "14.4", "14.5", "14.6", "14.7", "14.8", "14.9"]
    const badboys = ["14.3", "14.4", "14.5", "14.6", "14.7", "14.8", "14.9", "13.2", "13.4", "11.2", "11.6", "15.5", "18.2", "18.5"]
    const laenge_kurzline=[1, 1.5, 2, 2.5, 3, 3.5, 4]
    let allow = true
    let swap = {}
    let newvalue = 0
    let san_mass = {}
    let refresh = []
    let refresh_sorted = []
    const SHVliste2 = ["Reparatur", "Renovierung"]
    const direkt_teilern = ["BAA A", "BAA B", "BAC A", "BAC C", "BAD C", "BAD D", "BAF I", "BAH A", "BAJ B", "BAJ C", "BBE G", "BBE H"]
    const direkt_ing = ["BAD A", "BAF J", "BAF Z", "BAF K", "BAH E", "BAH Z", "BAM", "BAN", "BBE D", "BBE E", "BBE F", "BBE Z", "BBG", "BDE"]
    const schwachschaden = ["BAO", "BAP", , "BBE A", "BBE B", "BBE C", "BBB B", "BBB C", "BBB Z", "BBC"] 

    // deleting and combining teilerneuerung
    for(const shv of SHVliste2)
    {
        const renovierung = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === shv).benoetigte_arbeiten
        const copy_renovierung = renovierung
        for( let i = 0; i<copy_renovierung.length; i++)
        {
            if(check_true(teilerneuerung_lvz, renovierung[i].lvz) && renovierung[i].ignore != "ja")
            {
                for(let j = 0; j<copy_renovierung.length; j++)
                {
                    let i_von = Number(renovierung[i].station_von)
                    let i_bis = Number(renovierung[i].station_bis)
                    let j_von = Number(renovierung[j].station_von)
                    let j_bis = Number(renovierung[j].station_bis)
                    // a< von,bis <b
                    if(i!=j && j_von >= i_von && j_bis <= i_bis)
                    {
                        renovierung[j].ignore = "ja"
                    }
                    // von<a , a<bis<b renovierung[j]=> teilerneuerung 
                    if(check_true(teilerneuerung_lvz, renovierung[j].lvz) && j_von<i_von && j_bis<i_bis && j_bis>i_von)
                    {
                        renovierung[i].ignore = "ja"
                        renovierung[j].ignore = "ja"
                        i_von = j_von
                        const xxx = i_bis - i_von
                        renovierung[i].laenge = Math.round(xxx*10)/10
                        san_mass={grund: renovierung[i].grund, menge: renovierung[i].menge , station_von: renovierung[j].station_von, station_bis: Number(renovierung[i].station_bis), laenge: renovierung[i].laenge, klasse: "1", lvz: renovierung[i].lvz, bauweise: "                        renovierung"}
                        renovierung.push(san_mass)                    }
                    // von<a , a<bis<b renovierung[j]=> no teilerneuerung
                    if(check_true(teilerneuerung_lvz, renovierung[j].lvz) == false && j_von<i_von && j_bis<i_bis && j_bis>i_von)
                    {
                        renovierung[j].ignore = "ja"
                        newvalue = i_von
                        j_bis = newvalue
                        const xxx = j_bis - j_von
                        renovierung[j].laenge = Math.round(xxx*10)/10
                        san_mass={grund: renovierung[j].grund, menge: renovierung[j].menge , station_von: renovierung[j].station_von, station_bis: Number(renovierung[i].station_von), laenge: renovierung[j].laenge, klasse: "1", lvz: renovierung[j].lvz, bauweise: renovierung[j].bauweise}
                        renovierung.push(san_mass)
                    }
                    // a<von<b , bis>b renovierung[j]=> teilerneuerung 
                    if(check_true(teilerneuerung_lvz, renovierung[j].lvz) && j_bis>i_bis && j_von<i_bis && j_von>i_von)
                    {
                        renovierung[i].ignore = "ja"
                        renovierung[j].ignore = "ja"
                        newvalue = j_bis
                        i_bis = newvalue
                        const xxx = i_bis - i_von
                        renovierung[i].laenge = Math.round(xxx*10)/10
                        san_mass={grund: renovierung[i].grund, menge: renovierung[i].menge , station_von: Number(renovierung[i].station_von), station_bis: renovierung[j].station_bis, laenge: renovierung[i].laenge, klasse: "1", lvz: renovierung[i].lvz, bauweise: "offen"}
                        renovierung.push(san_mass)
                    }
                    // combining multiple teilerneuerung
                    if(check_true(teilerneuerung_lvz, renovierung[j].lvz) && i!=j && (j_von == i_bis || ((j_von - i_bis)<0.56 && j_von>i_bis)))
                    {
                        renovierung[j].ignore = "ja"
                        const xxx = j_bis - i_von
                        renovierung[j].laenge = Math.round(xxx*10)/10
                        san_mass={grund: renovierung[j].grund, menge: renovierung[j].menge , station_von: Number(renovierung[i].station_von), station_bis: renovierung[j].station_bis, laenge: renovierung[j].laenge, klasse: "1", lvz: renovierung[j].lvz, bauweise: renovierung[j].bauweise}
                        renovierung.push(san_mass)
                    }
                    // a<von<b , bis>b renovierung[j]=> no teilerneuerung
                    if(check_true(teilerneuerung_lvz, renovierung[j].lvz) == false && j_bis>i_bis && j_von<i_bis && j_von>i_von)
                    {
                        renovierung[j].ignore = "ja"
                        j_von = i_bis
                        const xxx = j_bis - j_von
                        renovierung[j].laenge = Math.round(xxx*10)/10
                        san_mass={grund: renovierung[j].grund, menge: renovierung[j].menge , station_von: Number(renovierung[i].station_bis), station_bis: renovierung[j].station_bis, laenge: renovierung[j].laenge, klasse: "1", lvz: renovierung[j].lvz, bauweise: renovierung[j].                        renovierung}
                        renovierung.push(san_mass)                    }
                }
            }
        }
        refresh = renovierung.filter(user => user.ignore != "ja" || user.ignore == null)
        refresh_sorted = refresh.sort((a, b) => a.station_von - b.station_von)
        renovierung.length = 0
        for( const i of refresh_sorted)
        {
            renovierung.push(i)
        }
    }
    // look at sanierung_raparatur line 74 for BAH Z and BAH E Removal

    // deleting double punctual damages
    for(const shv of SHVliste2) 
    {
        let flagING = true
        let sanierungsverfahren = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === shv).benoetigte_arbeiten
        const ll = sanierungsverfahren.length
        for( let i=0; i<ll; i++)
        {
            let flag = true
            let flag1 = true
            let flag2 = true
            let flag3 = true
            let flag4 = true
            let flag5 = true
            let flag6 = true
            let flag7 = true
            let flag8 = true
            let flag9 = true
            let menge = 1 //default value
            let laenge = 0.3 //default value
            let bauweise = ""
            let lvz = "" //unknown so far
            let klasse = "1"
            let von = Number(sanierungsverfahren[i].station_von)
            let bis = Number(sanierungsverfahren[i].station_bis)
            // I add b in order to take multiple elements to gether. like [A,B,C] first A and B, the result goes with C
            if(Number(sanierungsverfahren[i].station_von) == Number(sanierungsverfahren[i].station_bis) && check_true(vorarbeit, sanierungsverfahren[i].lvz) == false && check_true(direkt_teilern, sanierungsverfahren[i].grund) == false && check_true(direkt_ing, sanierungsverfahren[i].grund) == false && check_true(schwachschaden, sanierungsverfahren[i].grund) == false)
            {
                for(let j=i+1; j<ll; j++)
                {   
                        if(Number(sanierungsverfahren[j].station_von) == Number(sanierungsverfahren[j].station_bis) && Number(sanierungsverfahren[j].station_von) == Number(sanierungsverfahren[i].station_von) && check_true(vorarbeit, sanierungsverfahren[j].lvz) == false)
                        {
                            if(check_true(direkt_teilern, sanierungsverfahren[j].grund) == false && check_true(direkt_ing, sanierungsverfahren[j].grund) == false && check_true(schwachschaden, sanierungsverfahren[j].grund) == false)
                            {
                                const anw = matrix(sanierungsverfahren[i].grund, sanierungsverfahren[j].grund, kante)
    
                                // plus what must be done in correspondece to the answer of the matrix
                                if(anw == "TE")
                                {
                                    sanierungsverfahren[i].ignore = "ja"
                                    sanierungsverfahren[j].ignore = "ja"
                                    bauweise="offen"
                                    if(laenge == 0.3) // in case it is punktschade or StreckenS smaller than 2m
                                    {
                                        laenge = 2
                                        von -= 1
                                        bis = von + 2
                                    }
                                    if(von < 0.5)
                                    {
                                        von = 0
                                    }
                                    if(bis > get(kante.haltungslaenge)-0.5)
                                    {
                                        bis = get(kante.haltungslaenge)
                                    }
                                    if(get(kante.mittlere_tiefe)>=tiefe_teil[5]) 
                                    {
                                        san_mass={grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse: 2 , lvz: "16.6", bauweise}
                                        sanierungsverfahren.push(san_mass) 
                                        
                                    }else
                                    {
                                        for (let q=0; q<6; q++)
                                        {
                                            if(get(kante.mittlere_tiefe)<tiefe_teil[q])
                                            {
                                                if(flag)
                                                {
                                                    san_mass={grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz: teilerneuerung_lvz[q], bauweise}
                                                    sanierungsverfahren.push(san_mass)
                                                    flag = false
                                                }
                                            }  
                                        }
                                    }
                                }
                                else if(anw == "ING")
                                {
                                    sanierungsverfahren[i].ignore = "ja"
                                    sanierungsverfahren[j].ignore = "ja"
                                    lvz="Ingenieurmaessige Begutachtung"
                                    menge=""
                                    bauweise=""
                                    if(flagING)
                                    {
                                        san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                        sanierungsverfahren.push(san_mass)
                                        flagING = false
                                    }
                                }
                                else if(anw == sanierungsverfahren[i].grund)
                                {
                                    sanierungsverfahren[j].ignore = "ja"
                                    swap = sanierungsverfahren[j]
                                    sanierungsverfahren[j] = sanierungsverfahren[i]
                                    sanierungsverfahren[i] = swap
                                }
                                else if( anw == sanierungsverfahren[j].grund)
                                {
                                    sanierungsverfahren[i].ignore = "ja"
                                }
                                else if( anw == "1")
                                {
                                    for(const element of sanierungsverfahren)
                                    {
                                        if(element.station_von == Number(sanierungsverfahren[j].station_von))
                                        {
                                            element.ignore = "ja"
                                        }
                                    }
                                    if(flag1)
                                    {
                                        if(get(kante.profil.profilbreite) < 800)
                                        {
                                            lvz = "11.2"
                                            menge = 0.5
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                            lvz = "15.7"
                                            menge = 1
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }else
                                        {
                                            lvz = "18.2"
                                            menge = 1
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                            lvz = "18.9"
                                            menge = 1
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass) 
                                        }
                                        flag1 = false
                                    } 
                                }
                                else if( anw == "2")
                                {
                                    if(sanierungsverfahren[j].grund != "BAD B")
                                    {
                                        sanierungsverfahren[j].ignore = "ja"
                                        swap = sanierungsverfahren[j]
                                        sanierungsverfahren[j] = sanierungsverfahren[i]
                                        sanierungsverfahren[i] = swap
                                    }
                                    if(sanierungsverfahren[i].grund != "BAD B")
                                    {
                                        sanierungsverfahren[i].ignore = "ja"
                                    }
                                    if(flag2)
                                    {
                                        if(get(kante.profil.profilbreite) < 800)
                                        {
                                            lvz = "11.2"
                                            menge = 0.5
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }else
                                        {
                                            lvz = "18.2"
                                            menge = 1
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }
                                        flag2 = false
                                    }   
                                }
                                else if( anw == "3")
                                {
                                    if(sanierungsverfahren[j].grund != "BAI")
                                    {
                                        sanierungsverfahren[j].ignore = "ja"
                                        swap = sanierungsverfahren[j]
                                        sanierungsverfahren[j] = sanierungsverfahren[i]
                                        sanierungsverfahren[i] = swap
                                    }
                                    if(sanierungsverfahren[i].grund != "BAI")
                                    {
                                        sanierungsverfahren[i].ignore = "ja"
                                    }
                                    if(flag3)
                                    {
                                        if(get(kante.profil.profilbreite) < 800)
                                        {
                                            lvz = "11.2"
                                            menge = 0.5
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }else
                                        {
                                            lvz = "18.2"
                                            menge = 1
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }
                                        flag3 = false
                                    }
                                }
                                else if( anw == "4")
                                {
                                    if(sanierungsverfahren[j].grund != "BAJ A")
                                    {
                                        sanierungsverfahren[j].ignore = "ja"
                                        swap = sanierungsverfahren[j]
                                        sanierungsverfahren[j] = sanierungsverfahren[i]
                                        sanierungsverfahren[i] = swap
                                    }
                                    if(sanierungsverfahren[i].grund != "BAJ A")
                                    {
                                        sanierungsverfahren[i].ignore = "ja"
                                    }
                                    if(flag4)
                                    {
                                        if(get(kante.profil.profilbreite) < 800)
                                        {
                                            lvz = "11.2"
                                            menge = 0.5
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }else
                                        {
                                            lvz = "18.2"
                                            menge = 1
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }
                                        flag4 = false
                                    }
                                }
                                else if( anw == "5")
                                {
                                    if(sanierungsverfahren[j].grund != "BAC B")
                                    {
                                        sanierungsverfahren[j].ignore = "ja"
                                        swap = sanierungsverfahren[j]
                                        sanierungsverfahren[j] = sanierungsverfahren[i]
                                        sanierungsverfahren[i] = swap
                                    }
                                    if(sanierungsverfahren[i].grund != "BAC B")
                                    {
                                        sanierungsverfahren[i].ignore = "ja"
                                    }
                                    if(flag5)
                                    {
                                        if(get(kante.profil.profilbreite) < 800)
                                        {
                                            lvz = "11.2"
                                            menge = 0.5
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }else
                                        {
                                            lvz = "18.2"
                                            menge = 1
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }
                                        flag5 = false
                                    }
                                }
                                else if( anw == "6")
                                {
                                    if(sanierungsverfahren[j].grund != "BAE")
                                    {
                                        sanierungsverfahren[j].ignore = "ja"
                                        swap = sanierungsverfahren[j]
                                        sanierungsverfahren[j] = sanierungsverfahren[i]
                                        sanierungsverfahren[i] = swap
                                    }
                                    if(sanierungsverfahren[i].grund != "BAE")
                                    {
                                        sanierungsverfahren[i].ignore = "ja"
                                    }
                                    if(flag6)
                                    {
                                        if(get(kante.profil.profilbreite) < 800)
                                        {
                                            lvz = "11.2"
                                            menge = 0.5
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }else
                                        {
                                            lvz = "18.2"
                                            menge = 1
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }
                                        flag6 = false
                                    }    
                                }
                                else if( anw == "7")
                                {
                                    if(sanierungsverfahren[j].grund != "BAF F")
                                    {
                                        sanierungsverfahren[j].ignore = "ja"
                                        swap = sanierungsverfahren[j]
                                        sanierungsverfahren[j] = sanierungsverfahren[i]
                                        sanierungsverfahren[i] = swap
                                    }
                                    if(sanierungsverfahren[i].grund != "BAF F")
                                    {
                                        sanierungsverfahren[i].ignore = "ja"
                                    }
                                    if(flag7)
                                    {
                                        if(get(kante.profil.profilbreite) < 800)
                                        {
                                            lvz = "11.2"
                                            menge = 0.5
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }else
                                        {
                                            lvz = "18.2"
                                            menge = 1
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }
                                        flag7 = false
                                    }           
                                }
                                else if( anw == "8")
                                {
                                    if(sanierungsverfahren[j].grund != "BBF")
                                    {
                                        sanierungsverfahren[j].ignore = "ja"
                                        swap = sanierungsverfahren[j]
                                        sanierungsverfahren[j] = sanierungsverfahren[i]
                                        sanierungsverfahren[i] = swap
                                    }
                                    if(sanierungsverfahren[i].grund != "BBF")
                                    {
                                        sanierungsverfahren[i].ignore = "ja"
                                    }
                                    if(flag8)
                                    {
                                        if(get(kante.profil.profilbreite) < 800)
                                        {
                                            lvz = "11.2"
                                            menge = 0.5
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }else
                                        {
                                            lvz = "18.2"
                                            menge = 1
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }
                                        flag8 = false
                                    }             
                                }
                                else if( anw == "9")
                                {
                                    for(const element of sanierungsverfahren)
                                    {
                                        if(element.station_von == Number(sanierungsverfahren[j].station_von))
                                        {
                                            element.ignore = "ja"
                                        }
                                    }
                                    if(flag9)
                                    {
                                        if(get(kante.profil.profilbreite) < 800)
                                        {
                                            lvz = "15.7"
                                            menge = 1
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass)
                                        }else
                                        {
                                            lvz = "18.9"
                                            menge = 1
                                            bauweise = "geschlossen"
                                            san_mass = {grund: "Mehrfachschaden", menge, station_von: von, station_bis: bis, laenge, klasse, lvz, bauweise}
                                            sanierungsverfahren.push(san_mass) 
                                        }
                                        flag9 = false
                                    }                 
                                }
                            }
                            else if(check_true(direkt_teilern, sanierungsverfahren[j].grund) || check_true(direkt_ing, sanierungsverfahren[j].grund))
                            {
                                // take the second code in action and delete the first code
                                sanierungsverfahren[i].ignore = "ja"
                            }
                        else if(check_true(schwachschaden, sanierungsverfahren[j].grund))
                        {
                            // take the first code in action and delete the second code
                            sanierungsverfahren[j].ignore = "ja"
                            // here will be the result of the previous two elements will be taken for the next cycle
                            swap = sanierungsverfahren[j]
                            sanierungsverfahren[j] = sanierungsverfahren[i]
                            sanierungsverfahren[i] = swap
                        }
                    }
                }
            }
            else if(check_true(direkt_teilern, sanierungsverfahren[i].grund))
            {
                // take the first code in action and delete the second code
                for(let j=i+1; j<ll; j++)
                {   
                    if(Number(sanierungsverfahren[j].station_von) == Number(sanierungsverfahren[i].station_von) && check_true(vorarbeit, sanierungsverfahren[i].lvz) == false )
                    {
                        sanierungsverfahren[j].ignore = "ja"
                        swap = sanierungsverfahren[j]
                        sanierungsverfahren[j] = sanierungsverfahren[i]
                        sanierungsverfahren[i] = swap
                    }
                }
                
            }
            else if(check_true(direkt_ing, sanierungsverfahren[i].grund))
            {
                // take the first code in action and delete the second code
                for(let j=i+1; j<ll; j++)
                {   
                    if(Number(sanierungsverfahren[j].station_von) == Number(sanierungsverfahren[i].station_von) && check_true(vorarbeit, sanierungsverfahren[j].lvz) == false && direkt_teilern.includes(sanierungsverfahren[j].grund) == false)
                    {
                        sanierungsverfahren[j].ignore = "ja"
                        swap = sanierungsverfahren[j]
                        sanierungsverfahren[j] = sanierungsverfahren[i]
                        sanierungsverfahren[i] = swap
                    }else if(Number(sanierungsverfahren[j].station_von) == Number(sanierungsverfahren[i].station_von) && check_true(vorarbeit, sanierungsverfahren[i].lvz) == false && direkt_teilern.includes(sanierungsverfahren[j].grund))
                    {
                        sanierungsverfahren[i].ignore = "ja"
                    }
                }
            }
            else if(check_true(schwachschaden, sanierungsverfahren[i].grund))
            {
                // take the second code in action and delete the first code
                sanierungsverfahren[i].ignore = "ja"
            }
        }
        //if there is anything combined with ING, delete it
    
        for(let n=0; n<sanierungsverfahren.length; n++)
        {
            if(sanierungsverfahren[n].lvz == "Ingenieurmaessige Begutachtung" || check_true(teilerneuerung_lvz, sanierungsverfahren[n].lvz))
            {
                for(let m = 0; m<sanierungsverfahren.length; m++)
                {
                    if(n!=m && sanierungsverfahren[n].station_von == sanierungsverfahren[m].station_von)
                    {
                        sanierungsverfahren[m].ignore = "ja"
                    }
                }
            }
        }
        refresh = sanierungsverfahren.filter(user => user.ignore != "ja")
        refresh_sorted = refresh.sort((a, b) => a.station_von - b.station_von)
        sanierungsverfahren.length = 0
        for( const i of refresh_sorted)
        {
            sanierungsverfahren.push(i)
        }    
    }
    // deleting teilerneuerung from 14X, 13X, 15.5, 11.2, 11.6
    for(const shv of SHVliste2)
    {
        let duplikat_delete = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === shv).benoetigte_arbeiten
        const ll = duplikat_delete.length
        for(let i = 0; i<ll; i++)
        {
            if(Number(duplikat_delete[i].station_von) != Number(duplikat_delete[i].station_bis) && check_true(teilerneuerung_lvz, duplikat_delete[i].lvz) == false && check_true(vorarbeit, duplikat_delete[i].lvz) == false)
            {
                let number_of_teilern = 0
                let current_teilern = 0
                let last_TE_von = [0]
                let last_TE_bis = [0]
                for(let k=0; k<ll; k++)
                {
                    if(check_true(teilerneuerung_lvz, duplikat_delete[k].lvz) && duplikat_delete[k].station_von >= Number(duplikat_delete[i].station_von) && duplikat_delete[k].station_bis <= Number(duplikat_delete[i].station_bis))
                    {
                        last_TE_von[number_of_teilern] = duplikat_delete[k].station_von
                        last_TE_bis[number_of_teilern] = duplikat_delete[k].station_bis
                        number_of_teilern += 1
                    }
                }
                for(let j=0; j<ll; j++)
                {
                    if(check_true(teilerneuerung_lvz, duplikat_delete[j].lvz))
                    {
                        if(check_true(badboys, duplikat_delete[i].lvz) && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                        {
                            current_teilern += 1
                            const reason = duplikat_delete[i].grund // there is a bug if i directly inject i_grund
                            const cuz = duplikat_delete[i].lvz
                            duplikat_delete[i].ignore = "ja"
                            let x = Number(duplikat_delete[j].station_von) - Number(duplikat_delete[i].station_von)
                            let location = Math.round((Number(duplikat_delete[j].station_von) - x)*10)/10 // there is a bug if i directly inject i_von
                            if(location == 0)
                            { location = 0.02}
                            if(current_teilern == 1)
                            {
                                if(check_true(kurzliner_lvz, duplikat_delete[i].lvz))
                                {
                                    if(x >= laenge_kurzline[6])
                                    {
                                        san_mass={grund: reason, menge: Math.ceil(x/4), station_von: location, station_bis: Number(duplikat_delete[j].station_von), laenge: x, klasse: 1, lvz: "14.9", bauweise: "geschlossen"}
                                        duplikat_delete.push(san_mass)    
                                    }else
                                    {
                                        for (let i = 0; i<7; i++)
                                        {
                                            if(x <laenge_kurzline[i])
                                            {
                                                if(allow)
                                                {
                                                    san_mass={grund: reason, menge: Math.ceil(x/4), station_von: location, station_bis: Number(duplikat_delete[j].station_von), laenge: x, klasse: 1, lvz: kurzliner_lvz[i], bauweise: "geschlossen"}
                                                    duplikat_delete.push(san_mass)
                                                    allow = false
                                                }
                                            }
                                        }
                                    }
                                }else if(duplikat_delete[i].lvz == "13.4" || duplikat_delete[i].lvz == "13.2")
                                {
                                    san_mass={grund: reason, menge: Math.ceil(x/0.3), station_von: location, station_bis: Number(duplikat_delete[j].station_von), laenge: x, klasse: 1, lvz: cuz, bauweise: "geschlossen"}
                                    duplikat_delete.push(san_mass)
                                }else if(duplikat_delete[i].lvz == "11.6")
                                {
                                    san_mass={grund: reason, menge: Math.round(x*10)/10, station_von: location, station_bis: Number(duplikat_delete[j].station_von), laenge: x, klasse: 1, lvz: cuz, bauweise: "geschlossen"}
                                    duplikat_delete.push(san_mass) 
                                }
                            }else
                            {
                                if(check_true(kurzliner_lvz, duplikat_delete[i].lvz))
                                {
                                    x = Number(duplikat_delete[j].station_von) - last_TE_bis[current_teilern-2]
                                    if(x >= laenge_kurzline[6])
                                    {
                                        san_mass={grund: reason, menge: Math.ceil(x/4), station_von: last_TE_bis[current_teilern -2], station_bis: Number(duplikat_delete[j].station_von), laenge: x, klasse: 1, lvz: "14.9", bauweise: "geschlossen"}
                                        duplikat_delete.push(san_mass)    
                                    }else
                                    {
                                        for (let i = 0; i<7; i++)
                                        {
                                            if(x <laenge_kurzline[i])
                                            {
                                                if(allow)
                                                {
                                                    san_mass={grund: reason, menge: Math.ceil(x/4), station_von: last_TE_bis[current_teilern -2], station_bis: Number(duplikat_delete[j].station_von), laenge: x, klasse: 1, lvz: kurzliner_lvz[i], bauweise: "geschlossen"}
                                                    duplikat_delete.push(san_mass)
                                                    allow = false
                                                }
                                            }
                                        }
                                    }
                                }else if(duplikat_delete[i].lvz == "13.4" || duplikat_delete[i].lvz == "13.2")
                                {
                                    san_mass={grund: reason, menge: Math.ceil(x/0.3), station_von: last_TE_bis[current_teilern -2], station_bis: Number(duplikat_delete[j].station_von), laenge: x, klasse: 1, lvz: cuz, bauweise: "geschlossen"}
                                    duplikat_delete.push(san_mass)  
                                }else if(duplikat_delete[i].lvz == "11.6")
                                {
                                    san_mass={grund: reason, menge: Math.round(x*10)/10, station_von: last_TE_bis[current_teilern -2], station_bis: Number(duplikat_delete[j].station_von), laenge: x, klasse: 1, lvz: cuz, bauweise: "geschlossen"}
                                    duplikat_delete.push(san_mass) 
                                }
                            }
                            allow = true
                            if(number_of_teilern == current_teilern)
                            {
                                const y = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_bis)
                                if(check_true(kurzliner_lvz, duplikat_delete[i].lvz))
                                {
                                    if(y >= laenge_kurzline[6])
                                    {   // there is a bug if i directly inject i_bis
                                        san_mass={grund: reason, menge: Math.ceil(y/4), station_von: Number(duplikat_delete[j].station_bis), station_bis: Math.round((Number(duplikat_delete[j].station_bis) + y)*10)/10, laenge: y, klasse: 1, lvz: "14.9", bauweise: "geschlossen"}
                                        duplikat_delete.push(san_mass)    
                                    }else
                                    {
                                        for (let i = 0; i<7; i++)
                                        {
                                            if(y <laenge_kurzline[i])
                                            {
                                                if(allow)
                                                {   // there is a bug if i directly inject i_bis
                                                    san_mass={grund: reason, menge: Math.ceil(y/4), station_von: Number(duplikat_delete[j].station_bis), station_bis: Math.round((Number(duplikat_delete[j].station_bis) + y)*10)/10, laenge: y, klasse: 1, lvz: kurzliner_lvz[i], bauweise: "geschlossen"}
                                                    duplikat_delete.push(san_mass)
                                                    allow = false
                                                }
                                            }
                                        }
                                    }
                                }else if(duplikat_delete[i].lvz == "13.4" || duplikat_delete[i].lvz == "13.2")
                                {
                                    san_mass={grund: reason, menge: Math.ceil(y/0.3), station_von: Number(duplikat_delete[j].station_bis), station_bis: Math.round((Number(duplikat_delete[j].station_bis) + y)*10)/10, laenge: y, klasse: 1, lvz: cuz, bauweise: "geschlossen"}
                                    duplikat_delete.push(san_mass)  
                                }else if(duplikat_delete[i].lvz == "11.6")
                                {
                                    san_mass={grund: reason, menge: Math.round(x*10)/10, station_von: Number(duplikat_delete[j].station_bis), station_bis: Math.round((Number(duplikat_delete[j].station_bis) + y)*10)/10, laenge: y, klasse: 1, lvz: cuz, bauweise: "geschlossen"}
                                    duplikat_delete.push(san_mass)  
                                }
                            }
                            allow = true
                        }else if(check_true(badboys, duplikat_delete[i].lvz) && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) < Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_von))
                        {
                            const reason = duplikat_delete[i].grund // there is a bug, if i directly inject i_grund
                            const cuz = duplikat_delete[i].lvz
                            duplikat_delete[i].ignore = "ja"
                            let x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_bis)
                            const location = Math.round((Number(duplikat_delete[j].station_bis) + x)*10)/10
                            if(check_true(kurzliner_lvz, duplikat_delete[i].lvz))
                            {
                                if(x >= laenge_kurzline[6])
                                {
                                    san_mass={grund: reason, menge: Math.ceil(x/4), station_von: Number(duplikat_delete[j].station_bis), station_bis: location, laenge: x, klasse: 1, lvz: "14.9", bauweise: "geschlossen"}
                                    duplikat_delete.push(san_mass)    
                                }else
                                {
                                    for (let i = 0; i<7; i++)
                                    {
                                        if(x <laenge_kurzline[i])
                                        {
                                            if(allow)
                                            {
                                                san_mass={grund: reason, menge: Math.ceil(x/4), station_von: Number(duplikat_delete[j].station_bis), station_bis: location, laenge: x, klasse: 1, lvz: kurzliner_lvz[i], bauweise: "geschlossen"}
                                                duplikat_delete.push(san_mass)
                                                allow = false
                                            }
                                        }
                                    }
                                }
                            }else if(duplikat_delete[i].lvz == "13.4" || duplikat_delete[i].lvz == "13.2")
                            {
                                san_mass={grund: reason, menge: Math.ceil(x/0.3), station_von: Number(duplikat_delete[j].station_bis), station_bis: location, laenge: x, klasse: 1, lvz: cuz, bauweise: "geschlossen"}
                                duplikat_delete.push(san_mass)  
                            }else if(duplikat_delete[i].lvz == "11.6")
                            {
                                san_mass={grund: reason, menge: Math.round(x*10)/10, station_von: Number(duplikat_delete[j].station_bis), station_bis: location, laenge: x, klasse: 1, lvz: cuz, bauweise: "geschlossen"}
                                duplikat_delete.push(san_mass)  
                            }
                            allow = true
                        }else if(check_true(badboys, duplikat_delete[i].lvz) && Number(duplikat_delete[j].station_von) > Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                        {
                            const reason = duplikat_delete[i].grund // there is a bug if i directly inject i_grund
                            const cuz = duplikat_delete[i].lvz
                            duplikat_delete[i].ignore = "ja"
                            let x = Number(duplikat_delete[j].station_von) - Number(duplikat_delete[i].station_von)
                            let location = Math.round((Number(duplikat_delete[j].station_von) - x)*10)/10
                            if(location == 0)
                            {location = 0.02}
                            if(check_true(kurzliner_lvz, duplikat_delete[i].lvz))
                            {
                                if(x >= laenge_kurzline[6])
                                {
                                    san_mass={grund: reason, menge: Math.ceil(x/4), station_von: location, station_bis: Number(duplikat_delete[j].station_von), laenge: x, klasse: 1, lvz: "14.9", bauweise: "geschlossen"}
                                    duplikat_delete.push(san_mass)    
                                }else
                                {
                                    for (let i = 0; i<7; i++)
                                    {
                                        if(x <laenge_kurzline[i])
                                        {
                                            if(allow)
                                            {
                                                san_mass={grund: reason, menge: Math.ceil(x/4), station_von: location, station_bis: Number(duplikat_delete[j].station_von), laenge: x, klasse: 1, lvz: kurzliner_lvz[i], bauweise: "geschlossen"}
                                                duplikat_delete.push(san_mass)
                                                allow = false
                                            }
                                        }
                                    }
                                }
                            }else if(duplikat_delete[i].lvz == "13.4" || duplikat_delete[i].lvz == "13.2")
                            {
                                san_mass={grund: reason, menge: Math.ceil(x/0.3), station_von: location, station_bis: Number(duplikat_delete[j].station_von), laenge: x, klasse: 1, lvz: cuz, bauweise: "geschlossen"}
                                duplikat_delete.push(san_mass)  
                            }else if(duplikat_delete[i].lvz == "11.6")
                            {
                                san_mass={grund: reason, menge: Math.round(x*10)/10, station_von: location, station_bis: Number(duplikat_delete[j].station_von), laenge: x, klasse: 1, lvz: cuz, bauweise: "geschlossen"}
                                duplikat_delete.push(san_mass)  
                            }
                            allow = true
                        }
                    }
                }
            }
        }
        refresh = duplikat_delete.filter(user => user.ignore != "ja")
        refresh_sorted = refresh.sort((a, b) => a.station_von - b.station_von)
        duplikat_delete.length = 0
        for( const i of refresh_sorted)
        {
            duplikat_delete.push(i)
        }
    }
    // combining multiple cleaning processes with the same LVZ : 14X, 13X, 15.5, 11.2, 11.6
    for(const shv of SHVliste2)
    {
        let duplikat_delete = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === shv).benoetigte_arbeiten
        const ll = duplikat_delete.length
        for(let i=0; i< ll; i++)
        {
            if(duplikat_delete[i].ignore != "ja" && check_true(kurzliner_lvz, duplikat_delete[i].lvz))
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].ignore != "ja" && check_true(kurzliner_lvz, duplikat_delete[j].lvz) && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if(duplikat_delete[j].ignore != "ja" && check_true(kurzliner_lvz, duplikat_delete[j].lvz) && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        if(x >= laenge_kurzline[6])
                        {
                            san_mass={grund: "Mehrfachschäden", menge: Math.ceil(x/4), station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x, klasse: 1, lvz: "14.9", bauweise: "geschlossen"}
                            duplikat_delete.push(san_mass)    
                        }else
                        {
                            for (let i = 0; i<7; i++)
                            {
                                if(x <laenge_kurzline[i])
                                {
                                    if(allow)
                                    {
                                        san_mass={grund: "Mehrfachschäden", menge: Math.ceil(x/4), station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x, klasse: 1, lvz: kurzliner_lvz[i], bauweise: "geschlossen"}
                                        duplikat_delete.push(san_mass)
                                        allow=false
                                    }
                                }
                            }
                        }
                    }else if(duplikat_delete[j].ignore != "ja" && check_true(kurzliner_lvz, duplikat_delete[j].lvz) && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        if(x >= laenge_kurzline[6])
                        {
                            san_mass={grund: "Mehrfachschäden", menge: Math.ceil(x/4), station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x, klasse: 1, lvz: "14.9", bauweise: "geschlossen"}
                            duplikat_delete.push(san_mass)    
                        }else
                        {
                            for (let i = 0; i<7; i++)
                            {
                                if(x <laenge_kurzline[i])
                                {
                                    if(allow)
                                    {
                                        san_mass={grund: "Mehrfachschäden", menge: Math.ceil(x/4), station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x, klasse: 1, lvz: kurzliner_lvz[i], bauweise: "geschlossen"}
                                        duplikat_delete.push(san_mass)
                                        allow=false
                                    }
                                }
                            }
                        }
                    }else if(duplikat_delete[j].ignore != "ja" && check_true(kurzliner_lvz, duplikat_delete[j].lvz) && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
            if(duplikat_delete[i].ignore != "ja" && duplikat_delete[i].lvz == "13.4")
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].lvz == "13.4" && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if( duplikat_delete[j].lvz == "13.4" && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x , klasse: 1 , lvz: "13.4", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "13.4" && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x , klasse: 1 , lvz: "13.4", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "13.4" && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
            if(duplikat_delete[i].ignore != "ja" && duplikat_delete[i].lvz == "13.2")
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].lvz == "13.2" && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if( duplikat_delete[j].lvz == "13.2" && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x , klasse: 1 , lvz: "13.2", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "13.2" && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x , klasse: 1 , lvz: "13.2", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "13.2" && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
            if(duplikat_delete[i].ignore != "ja" && duplikat_delete[i].lvz == "15.5")
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].lvz == "15.5" && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if( duplikat_delete[j].lvz == "15.5" && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x , klasse: 1 , lvz: "15.5", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "15.5" && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x , klasse: 1 , lvz: "15.5", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "15.5" && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
            if(duplikat_delete[i].ignore != "ja" && duplikat_delete[i].lvz == "11.6")
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].lvz == "11.6" && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if( duplikat_delete[j].lvz == "11.6" && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: Math.round(x*10)/10, station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x , klasse: 1 , lvz: "11.6", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "11.6" && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: Math.round(x*10)/10, station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x , klasse: 1 , lvz: "11.6", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "11.6" && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
            if(duplikat_delete[i].ignore != "ja" && duplikat_delete[i].lvz == "11.2")
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].lvz == "11.2" && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if( duplikat_delete[j].lvz == "11.2" && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: 0.25*(Math.floor(x)+2), station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x , klasse: 1 , lvz: "11.2", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "11.2" && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: 0.25*(Math.floor(x)+2), station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x , klasse: 1 , lvz: "11.2", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "11.2" && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
            if(duplikat_delete[i].ignore != "ja" && duplikat_delete[i].lvz == "18.2")
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].lvz == "18.2" && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if( duplikat_delete[j].lvz == "18.2" && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: 0.5*(Math.floor(x)+1.5), station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x , klasse: 1 , lvz: "18.2", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "18.2" && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: 0.5*(Math.floor(x)+1.5), station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x , klasse: 1 , lvz: "18.2", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "18.2" && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
            if(duplikat_delete[i].ignore != "ja" && duplikat_delete[i].lvz == "18.5")
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].lvz == "18.5" && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if( duplikat_delete[j].lvz == "18.5" && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x , klasse: 1 , lvz: "18.5", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "18.5" && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x , klasse: 1 , lvz: "18.5", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "18.5" && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
        }
        refresh = duplikat_delete.filter(user => user.ignore != "ja")
        refresh_sorted = refresh.sort((a, b) => a.station_von - b.station_von)
        duplikat_delete.length = 0
        for( const i of refresh_sorted)
        {
            duplikat_delete.push(i)
        }
    }
    for(const shv of SHVliste2)
    {
        let duplikat_delete = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === shv).benoetigte_arbeiten
        const ll = duplikat_delete.length
        for(let i=0; i< ll; i++)
        {
            if(duplikat_delete[i].ignore != "ja" && check_true(kurzliner_lvz, duplikat_delete[i].lvz))
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].ignore != "ja" && check_true(kurzliner_lvz, duplikat_delete[j].lvz) && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if(duplikat_delete[j].ignore != "ja" && check_true(kurzliner_lvz, duplikat_delete[j].lvz) && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        if(x >= laenge_kurzline[6])
                        {
                            san_mass={grund: "Mehrfachschäden", menge: Math.ceil(x/4), station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x, klasse: 1, lvz: "14.9", bauweise: "geschlossen"}
                            duplikat_delete.push(san_mass)    
                        }else
                        {
                            for (let i = 0; i<7; i++)
                            {
                                if(x <laenge_kurzline[i])
                                {
                                    if(allow)
                                    {
                                        san_mass={grund: "Mehrfachschäden", menge: Math.ceil(x/4), station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x, klasse: 1, lvz: kurzliner_lvz[i], bauweise: "geschlossen"}
                                        duplikat_delete.push(san_mass)
                                        allow=false
                                    }
                                }
                            }
                        }
                    }else if(duplikat_delete[j].ignore != "ja" && check_true(kurzliner_lvz, duplikat_delete[j].lvz) && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        if(x >= laenge_kurzline[6])
                        {
                            san_mass={grund: "Mehrfachschäden", menge: Math.ceil(x/4), station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x, klasse: 1, lvz: "14.9", bauweise: "geschlossen"}
                            duplikat_delete.push(san_mass)    
                        }else
                        {
                            for (let i = 0; i<7; i++)
                            {
                                if(x <laenge_kurzline[i])
                                {
                                    if(allow)
                                    {
                                        san_mass={grund: "Mehrfachschäden", menge: Math.ceil(x/4), station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x, klasse: 1, lvz: kurzliner_lvz[i], bauweise: "geschlossen"}
                                        duplikat_delete.push(san_mass)
                                        allow=false
                                    }
                                }
                            }
                        }
                    }else if(duplikat_delete[j].ignore != "ja" && check_true(kurzliner_lvz, duplikat_delete[j].lvz) && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
            if(duplikat_delete[i].ignore != "ja" && duplikat_delete[i].lvz == "13.4")
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].lvz == "13.4" && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if( duplikat_delete[j].lvz == "13.4" && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x , klasse: 1 , lvz: "13.4", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "13.4" && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x , klasse: 1 , lvz: "13.4", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "13.4" && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
            if(duplikat_delete[i].ignore != "ja" && duplikat_delete[i].lvz == "13.2")
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].lvz == "13.2" && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if( duplikat_delete[j].lvz == "13.2" && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x , klasse: 1 , lvz: "13.2", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "13.2" && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x , klasse: 1 , lvz: "13.2", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "13.2" && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
            if(duplikat_delete[i].ignore != "ja" && duplikat_delete[i].lvz == "15.5")
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].lvz == "15.5" && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if( duplikat_delete[j].lvz == "15.5" && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x , klasse: 1 , lvz: "15.5", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "15.5" && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x , klasse: 1 , lvz: "15.5", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "15.5" && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
            if(duplikat_delete[i].ignore != "ja" && duplikat_delete[i].lvz == "11.6")
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].lvz == "11.6" && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if( duplikat_delete[j].lvz == "11.6" && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: Math.round(x*10)/10, station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x , klasse: 1 , lvz: "11.6", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "11.6" && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: Math.round(x*10)/10, station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x , klasse: 1 , lvz: "11.6", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "11.6" && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
            if(duplikat_delete[i].ignore != "ja" && duplikat_delete[i].lvz == "11.2")
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].lvz == "11.2" && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if( duplikat_delete[j].lvz == "11.2" && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: 0.25*(Math.floor(x)+2), station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x , klasse: 1 , lvz: "11.2", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "11.2" && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: 0.25*(Math.floor(x)+2), station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x , klasse: 1 , lvz: "11.2", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "11.2" && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
            if(duplikat_delete[i].ignore != "ja" && duplikat_delete[i].lvz == "18.2")
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].lvz == "18.2" && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if( duplikat_delete[j].lvz == "18.2" && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: 0.5*(Math.floor(x)+1.5), station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x , klasse: 1 , lvz: "18.2", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "18.2" && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: 0.5*(Math.floor(x)+1.5), station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x , klasse: 1 , lvz: "18.2", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "18.2" && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
            if(duplikat_delete[i].ignore != "ja" && duplikat_delete[i].lvz == "18.5")
            {
                for(let j=0; j< ll; j++)
                {
                    if(i!=j && duplikat_delete[j].lvz == "18.5" && Number(duplikat_delete[j].station_von) >= Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) <= Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[j].ignore = "ja"
                    }else if( duplikat_delete[j].lvz == "18.5" && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis)<Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[i].station_bis) - Number(duplikat_delete[j].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[j].station_von), station_bis: Number(duplikat_delete[i].station_bis), laenge: x , klasse: 1 , lvz: "18.5", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "18.5" && Number(duplikat_delete[j].station_von)>Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_von)<Number(duplikat_delete[i].station_bis) && Number(duplikat_delete[j].station_bis)>Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                        duplikat_delete[j].ignore = "ja"
                        const x = Number(duplikat_delete[j].station_bis) - Number(duplikat_delete[i].station_von)
                        san_mass={grund: duplikat_delete[i].grund, menge: duplikat_delete[i].menge + duplikat_delete[j].menge, station_von: Number(duplikat_delete[i].station_von), station_bis: Number(duplikat_delete[j].station_bis), laenge: x , klasse: 1 , lvz: "18.5", bauweise: "geschlossen"}
                        duplikat_delete.push(san_mass)
                    }else if(duplikat_delete[j].lvz == "18.5" && Number(duplikat_delete[j].station_von) < Number(duplikat_delete[i].station_von) && Number(duplikat_delete[j].station_bis) > Number(duplikat_delete[i].station_bis))
                    {
                        duplikat_delete[i].ignore = "ja"
                    }
                }
            }
        }
        refresh = duplikat_delete.filter(user => user.ignore != "ja")
        refresh_sorted = refresh.sort((a, b) => a.station_von - b.station_von)
        duplikat_delete.length = 0
        for( const i of refresh_sorted)
        {
            duplikat_delete.push(i)
        }
    }
    // deleting those which has been produced extra but their costs are zero
    for(const shv of SHVliste2)
    {
        let duplikat_delete = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === shv).benoetigte_arbeiten
        for(let element of duplikat_delete)
        {
            if(element.menge == 0 || element.kosten <= 0.5)
            {
                element.ignore = "ja"
            }
        }
        refresh = duplikat_delete.filter(user => user.ignore != "ja")
        refresh_sorted = refresh.sort((a, b) => a.station_von - b.station_von)
        duplikat_delete.length = 0
        for( const i of refresh_sorted)
        {
            duplikat_delete.push(i)
        }
    }
    // Anschlüsse öffnen für Kurzliner
    for(const shv of SHVliste2)
    {
        let sanierung = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === shv).benoetigte_arbeiten
        for(let element of sanierung)
        {
            if(check_true(kurzliner_lvz, element.lvz) && Number(element.station_bis) != Number(element.station_von))
            {
                const upper_margin = Number(element.station_bis)
                const lower_margin = Number(element.station_von)
                for(const member of zustand)
                {
                    if(get(member.kode) == "BCA" && Number(member.station) <= upper_margin && Number(member.station) >= lower_margin)
                    {
                        san_mass={grund: "BCA", menge: 1 , station_von: Number(member.station), station_bis: Number(member.station), laenge: 0.3, klasse: "1", lvz: "12.14", bauweise: "geschlossen"}
                        sanierung.push(san_mass)
                    }
                }
            }
        }
        sanierung = sanierung.sort((a, b) => a.station_von - b.station_von)
    }
    // Arbeiteinrichtung löschen/hinzufügen
    for(const shv of SHVliste2)
    {
        let sanierung = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === shv).benoetigte_arbeiten
        // löschen diejenige, die extra sind
        let redflag = true
        for(let element of sanierung)
        {
            if(element.lvz == "11.1")
            {
                for(let runner of sanierung)
                {
                    if(runner.lvz == "11.2" || runner.lvz == "11.6")
                    {
                        redflag = false
                    }
                }
                if(redflag)
                {
                    element.ignore = "ja"
                }
                redflag = true
            }
            else if(element.lvz == "12.1")
            {
                for(let runner of sanierung)
                {
                    if(runner.lvz == "12.3" || runner.lvz == "12.5" || runner.lvz == "12.9" || runner.lvz == "12.14")
                    {
                        redflag = false
                    }
                }
                if(redflag)
                {
                    element.ignore = "ja"
                }
                redflag = true
            }
            else if(element.lvz == "13.1")
            {
                for(let runner of sanierung)
                {
                    if(runner.lvz == "13.2" || runner.lvz == "13.4")
                    {
                        redflag = false
                    }
                }
                if(redflag)
                {
                    element.ignore = "ja"
                }
                redflag = true
            }
            else if(element.lvz == "14.1")
            {
                for(let runner of sanierung)
                {
                    if(check_true(kurzliner_lvz, runner.lvz))
                    {
                        redflag = false
                    }
                }
                if(redflag)
                {
                    element.ignore = "ja"
                }
                redflag = true
            }
            else if(element.lvz == "15.1")
            {
                for(let runner of sanierung)
                {
                    if(runner.lvz == "15.5" || runner.lvz == "15.7" || runner.lvz == "15.6")
                    {
                        redflag = false
                    }
                }
                if(redflag)
                {
                    element.ignore = "ja"
                }
                redflag = true
            }
            else if(element.lvz == "18.1")
            {
                for(let runner of sanierung)
                {
                    if(check_true(s18, runner.lvz))
                    {
                        redflag = false
                    }
                }
                if(redflag)
                {
                    element.ignore = "ja"
                }
                redflag = true
            }
            else if(element.lvz == "31.1")
            {
                for(let runner of sanierung)
                {
                    if(runner.lvz == "31.2")
                    {
                        redflag = false
                    }
                }
                if(redflag)
                {
                    element.ignore = "ja"
                }
                redflag = true
            }
            else if(element.lvz == "22.1")
            {
                for(let runner of sanierung)
                {
                    if(runner.lvz == "22.4")
                    {
                        redflag = false
                    }
                }
                if(redflag)
                {
                    element.ignore = "ja"
                }
                redflag = true
            }
        }
        // hunzufügne diejenige, die fählen noch
        let once = true
        redflag = true
        for(let element of sanierung)
        {
            if(element.lvz == "11.2" || element.lvz == "11.6")
            {
                for(let runner of sanierung)
                {
                    if(runner.lvz == "11.1")
                    {
                        redflag = false
                    }
                }
                if(redflag && once)
                {
                    san_mass={grund: element.grund, menge: element.menge, station_von: element.station_von, station_bis: element.station_bis, laenge: element.laenge, klasse: element.klasse, lvz: "11.1", bauweise: element.bauweise}
                    sanierung.push(san_mass)  
                    once = false
                }
                redflag = true
                once = true
            }
            else if(element.lvz == "12.3" || element.lvz == "12.5" || element.lvz == "12.9" || element.lvz == "12.14")
            {
                for(let runner of sanierung)
                {
                    if(runner.lvz == "12.1")
                    {
                        redflag = false
                    }
                }
                if(redflag && once)
                {
                    san_mass={grund: element.grund, menge: element.menge, station_von: element.station_von, station_bis: element.station_bis, laenge: element.laenge, klasse: element.klasse, lvz: "12.1", bauweise: element.bauweise}
                    sanierung.push(san_mass)
                    once = false
                }
                redflag = true
                once = true
            }
            else if(element.lvz == "13.2" || element.lvz == "13.4")
            {
                for(let runner of sanierung)
                {
                    if(runner.lvz == "13.1")
                    {
                        redflag = false
                    }
                }
                if(redflag && once)
                {
                    san_mass={grund: element.grund, menge: element.menge, station_von: element.station_von, station_bis: element.station_bis, laenge: element.laenge, klasse: element.klasse, lvz: "13.1", bauweise: element.bauweise}
                    sanierung.push(san_mass)
                    once = false
                }
                redflag = true
                once = true
            }
            else if(check_true(kurzliner_lvz, element.lvz))
            {
                for(let runner of sanierung)
                {
                    if(runner.lvz == "14.1")
                    {
                        redflag = false
                    }
                }
                if(redflag && once)
                {
                    san_mass={grund: element.grund, menge: element.menge, station_von: element.station_von, station_bis: element.station_bis, laenge: element.laenge, klasse: element.klasse, lvz: "14.1", bauweise: element.bauweise}
                    sanierung.push(san_mass)
                    once = false
                }
                redflag = true
                once = true
            }
            else if(element.lvz == "15.5" || element.lvz == "15.7" || element.lvz == "15.6")
            {
                for(let runner of sanierung)
                {
                    if(runner.lvz == "15.1")
                    {
                        redflag = false
                    }
                }
                if(redflag && once)
                {
                    san_mass={grund: element.grund, menge: element.menge, station_von: element.station_von, station_bis: element.station_bis, laenge: element.laenge, klasse: element.klasse, lvz: "15.1", bauweise: element.bauweise}
                    sanierung.push(san_mass)
                    once = false
                }
                redflag = true
                once = true
            }
            else if(check_true(s18, element.lvz))
            {
                for(let runner of sanierung)
                {
                    if(runner.lvz == "18.1")
                    {
                        redflag = false
                    }
                }
                if(redflag && once)
                {
                    san_mass={grund: element.grund, menge: element.menge, station_von: element.station_von, station_bis: element.station_bis, laenge: element.laenge, klasse: element.klasse, lvz: "18.1", bauweise: element.bauweise}
                    sanierung.push(san_mass)
                    once = false
                }
                redflag = true
                once = true
            }
            else if(element.lvz == "31.2")
            {
                for(let runner of sanierung)
                {
                    if(runner.lvz == "31.1")
                    {
                        redflag = false
                    }
                }
                if(redflag && once)
                {
                    san_mass={grund: element.grund, menge: element.menge, station_von: element.station_von, station_bis: element.station_bis, laenge: element.laenge, klasse: element.klasse, lvz: "31.1", bauweise: element.bauweise}
                    sanierung.push(san_mass)
                    once = false
                }
                redflag = true
                once = true
            }
            else if(element.lvz == "22.4")
            {
                for(let runner of sanierung)
                {
                    if(runner.lvz == "22.1")
                    {
                        redflag = false
                    }
                }
                if(redflag && once)
                {
                    san_mass={grund: element.grund, menge: element.menge, station_von: element.station_von, station_bis: element.station_bis, laenge: element.laenge, klasse: element.klasse, lvz: "22.1", bauweise: element.bauweise}
                    sanierung.push(san_mass)
                    once = false
                }
                redflag = true
                once = true
            }
        }
        sanierung = sanierung.sort((a, b) => a.station_von - b.station_von)
        refresh = sanierung.filter(user => user.ignore != "ja")
        sanierung.length = 0
        for( const i of refresh)
        {
            sanierung.push(i)
        }
    }
}