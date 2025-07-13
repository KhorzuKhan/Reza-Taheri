import {getLVZValue} from "../lvz_utilitys.js"

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

export function kosten_ermittlung(lv, inspection, kante)
{
    const SHVlist = ["Reparatur", "Renovierung", "Erneuerung"]
    const sth = ["2.1", "3.1","11.1", "11.7" , "12.1", "12.3", "12.5", "13.1","14.1","15.1","15.6","18.1","18.2", "18.10","22.1","22.4","31.1"]
    const durchmesser = get(kante.profil.profilbreite)
    let price = 0.213
    for( const shv of SHVlist)
    {
        let sanierung = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === shv).benoetigte_arbeiten
        if(sanierung.length > 0)
        {
            for( const member of sanierung)
            {
                const lvz = member.lvz
                if(member.klasse == 2)
                {
                    let k5 = getLVZValue(lv, "16.5.100", durchmesser, 0) + getLVZValue(lv, "16.5.200", durchmesser, 0)*(member.laenge-1) + getLVZValue(lv, "16.5.300", durchmesser, 0)*0.2
                    let k6 = getLVZValue(lv, "16.6.100", durchmesser, 0) + getLVZValue(lv, "16.6.200", durchmesser, 0)*(member.laenge-1) + getLVZValue(lv, "16.6.300", durchmesser, 0)*0.2
                    let faktor = get(kante.mittlere_tiefe) - 6 // 6 m ist das maximale Tiefe in lv
                    price = faktor*(k6 - k5) + k6
                    member.kosten = price*1.15*member.menge
                }else if(lvz == "Ingenieurmaessige Begutachtung")
                {
                    price = "kein Preis: ING"
                    member.kosten = price
                }else if(check_true(sth, lvz))
                {
                    price = getLVZValue(lv, lvz, durchmesser, 0)
                    member.kosten = price*member.menge
                }else if(member.klasse == 3) // Erneuerung
                {
                    let k5 = getLVZValue(lv, "51.5.100", durchmesser, 0)*member.laenge + getLVZValue(lv, "51.5.200", durchmesser, 0)/5
                    let k6 = getLVZValue(lv, "51.6.100", durchmesser, 0)*member.laenge + getLVZValue(lv, "51.6.200", durchmesser, 0)/5
                    let faktor = get(kante.mittlere_tiefe) - 6 // 6 m ist das maximale Tiefe in lv
                    price = faktor*(k6 - k5) + k6
                    member.kosten = price*1.15*member.menge
                }else if(lvz == "2.2")
                {
                    price = getLVZValue(lv, "2.2.100", durchmesser, 0) + getLVZValue(lv, "2.2.200", durchmesser, 0)
                    member.kosten = price*1.15*member.menge
                }else if(lvz == "3.2")
                {
                    if(member.laenge<= 50)
                    {
                        price = getLVZValue(lv, "3.2.100", durchmesser, 0)*member.laenge + getLVZValue(lv, "3.2.200", durchmesser, 0)
                    }else
                    {
                        price = getLVZValue(lv, "3.2.100", durchmesser, 0)*member.laenge + getLVZValue(lv, "3.2.300", durchmesser, 0)
                    }
                    member.kosten = price*1.15*member.menge
                }else if(lvz == "3.8")
                {
                    price = getLVZValue(lv, "3.8.110", durchmesser, 0)*member.laenge
                    member.kosten = price*1.15*member.menge
                }else if(lvz == "5.1")
                {
                    price = getLVZValue(lv, "5.1.100", durchmesser, 0)*member.laenge
                    member.kosten = price*1.15*member.menge
                }else if(lvz == "11.2")
                {
                    price = getLVZValue(lv, "11.2.110", durchmesser, 0)
                    member.kosten = price*1.15*member.menge
                }else if(lvz == "11.6")
                {
                    price = getLVZValue(lv, "11.6.100", durchmesser, 0) + getLVZValue(lv, "11.6.200", durchmesser, 0)*0.2
                    member.kosten = price*1.15*member.laenge
                }else if(lvz == "12.14")
                {
                    price = getLVZValue(lv, "12.14.110", durchmesser, 0)*1,15
                    member.kosten = price
                }else if(lvz == "13.2")
                {
                    price = getLVZValue(lv, "13.2.100", durchmesser, 0) + getLVZValue(lv, "13.2.200", durchmesser, 0)*0.2
                    member.kosten = price*1.15*member.menge
                }else if(lvz == "13.4")
                {
                    price = getLVZValue(lv, "13.4.100", durchmesser, 0) + getLVZValue(lv, "13.4.200", durchmesser, 0)*0.2
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "14.2")
                {
                    price = getLVZValue(lv, "14.2.100", durchmesser, 0) + getLVZValue(lv, "14.2.200", durchmesser, 0)*0.5 + getLVZValue(lv, "14.2.300", durchmesser, 0)*0.5 + getLVZValue(lv, "14.2.400", durchmesser, 0)
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "14.3")
                {
                    price = getLVZValue(lv, "14.3.100", durchmesser, 0) + getLVZValue(lv, "14.3.200", durchmesser, 0)*0.5 + getLVZValue(lv, "14.3.300", durchmesser, 0)*0.5 + getLVZValue(lv, "14.3.400", durchmesser, 0)
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "14.4")
                {
                    price = getLVZValue(lv, "14.4.100", durchmesser, 0) + getLVZValue(lv, "14.4.200", durchmesser, 0)*0.5 + getLVZValue(lv, "14.4.300", durchmesser, 0)*0.5 + getLVZValue(lv, "14.4.400", durchmesser, 0)
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "14.5")
                {
                    price = getLVZValue(lv, "14.5.100", durchmesser, 0) + getLVZValue(lv, "14.5.200", durchmesser, 0)*0.5 + getLVZValue(lv, "14.5.300", durchmesser, 0)*0.5 + getLVZValue(lv, "14.5.400", durchmesser, 0)
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "14.6")
                {
                    price = getLVZValue(lv, "14.6.100", durchmesser, 0) + getLVZValue(lv, "14.6.200", durchmesser, 0)*0.5 + getLVZValue(lv, "14.6.300", durchmesser, 0)*0.5 + getLVZValue(lv, "14.6.400", durchmesser, 0)
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "14.7")
                {
                    price = getLVZValue(lv, "14.7.100", durchmesser, 0) + getLVZValue(lv, "14.7.200", durchmesser, 0)*0.5 + getLVZValue(lv, "14.7.300", durchmesser, 0)*0.5 + getLVZValue(lv, "14.7.400", durchmesser, 0)
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "14.8")
                {
                    price = getLVZValue(lv, "14.8.100", durchmesser, 0) + getLVZValue(lv, "14.8.200", durchmesser, 0)*0.5 + getLVZValue(lv, "14.8.300", durchmesser, 0)*0.5 + getLVZValue(lv, "14.8.400", durchmesser, 0)
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "14.9")
                {
                    price = getLVZValue(lv, "14.9.100", durchmesser, 0) + getLVZValue(lv, "14.9.200", durchmesser, 0)*0.5 + getLVZValue(lv, "14.9.300", durchmesser, 0)*0.5 + getLVZValue(lv, "14.9.400", durchmesser, 0)
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "15.5")
                {
                    price = getLVZValue(lv, "15.5.100", durchmesser, 0) 
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "15.7")
                {
                    price = getLVZValue(lv, "15.7.110", durchmesser, 0) 
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "16.1")
                {
                    price = getLVZValue(lv, "16.1.100", durchmesser, 0) + getLVZValue(lv, "16.1.200", durchmesser, 0)*(member.laenge-1) + getLVZValue(lv, "16.1.300", durchmesser, 0)*0.2
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "16.2")
                {
                    price = getLVZValue(lv, "16.2.100", durchmesser, 0) + getLVZValue(lv, "16.2.200", durchmesser, 0)*(member.laenge-1) + getLVZValue(lv, "16.2.300", durchmesser, 0)*0.2
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "16.3")
                {
                    price = getLVZValue(lv, "16.3.100", durchmesser, 0) + getLVZValue(lv, "16.3.200", durchmesser, 0)*(member.laenge-1) + getLVZValue(lv, "16.3.300", durchmesser, 0)*0.2
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "16.4")
                {
                    price = getLVZValue(lv, "16.4.100", durchmesser, 0) + getLVZValue(lv, "16.4.200", durchmesser, 0)*(member.laenge-1) + getLVZValue(lv, "16.4.300", durchmesser, 0)*0.2
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "16.5")
                {
                    price = getLVZValue(lv, "16.5.100", durchmesser, 0) + getLVZValue(lv, "16.5.200", durchmesser, 0)*(member.laenge-1) + getLVZValue(lv, "16.5.300", durchmesser, 0)*0.2
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "16.6")
                {
                    price = getLVZValue(lv, "16.6.100", durchmesser, 0) + getLVZValue(lv, "16.6.200", durchmesser, 0)*(member.laenge-1) + getLVZValue(lv, "16.6.300", durchmesser, 0)*0.2
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "18.4")
                {
                    price = getLVZValue(lv, "18.4.110", durchmesser, 0)*member.menge + getLVZValue(lv, "18.4.120", durchmesser, 0)*0.2
                    member.kosten = price*1.15
                }
                else if(lvz == "18.5")
                {
                    price = getLVZValue(lv, "18.5.110", durchmesser, 0)*member.menge + getLVZValue(lv, "18.5.120", durchmesser, 0)*0.2
                    member.kosten = price*1.15
                }
                else if(lvz == "18.7")
                {
                    price = getLVZValue(lv, "18.7.110", durchmesser, 0)*member.menge + getLVZValue(lv, "18.7.120", durchmesser, 0)*member.menge + getLVZValue(lv, "18.7.130", durchmesser, 0)*0.2 + getLVZValue(lv, "18.7.140", durchmesser, 0)
                    member.kosten = price*1.15
                }
                else if(lvz == "18.8")
                {
                    price = getLVZValue(lv, "18.8.110", durchmesser, 0)*member.menge + getLVZValue(lv, "18.8.120", durchmesser, 0)*0.2 + getLVZValue(lv, "18.8.130", durchmesser, 0)
                    member.kosten = price*1.15
                }
                else if(lvz == "18.9")
                {
                    price = getLVZValue(lv, "18.9.110", durchmesser, 0)*member.menge + getLVZValue(lv, "18.9.120", durchmesser, 0)*0.2 + getLVZValue(lv, "18.9.130", durchmesser, 0)
                    member.kosten = price*1.15
                }
                else if(lvz == "18.10")
                {
                    price = getLVZValue(lv, "18.10.110", durchmesser, 0)*member.menge + getLVZValue(lv, "18.10.120", durchmesser, 0)*0.2 + getLVZValue(lv, "18.10.130", durchmesser, 0)
                    member.kosten = price*1.15
                }
                else if(lvz == "31.2")
                {
                    const xyz = ["31.2.300", "31.2.400", "31.2.500", "31.2.600"]
                    let easy = 0
                    for(const element of xyz)
                    {
                        easy += getLVZValue(lv, element, durchmesser, 0)
                    }
                    price = getLVZValue(lv, "31.2.50",durchmesser, 0)*member.laenge + getLVZValue(lv, "31.2.100",durchmesser, 0)*member.laenge + easy*0.5 + getLVZValue(lv, "31.2.700",durchmesser, 0)/30
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "51.1")
                {
                    price = getLVZValue(lv, "51.1.100", durchmesser, 0)*member.laenge + getLVZValue(lv, "51.1.200", durchmesser, 0)/5
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "51.2")
                {
                    price = getLVZValue(lv, "51.2.100", durchmesser, 0)*member.laenge + getLVZValue(lv, "51.2.200", durchmesser, 0)/5
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "51.3")
                {
                    price = getLVZValue(lv, "51.3.100", durchmesser, 0)*member.laenge + getLVZValue(lv, "51.3.200", durchmesser, 0)/5
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "51.4")
                {
                    price = getLVZValue(lv, "51.4.100", durchmesser, 0)*member.laenge + getLVZValue(lv, "51.4.200", durchmesser, 0)/5
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "51.5")
                {
                    price = getLVZValue(lv, "51.5.100", durchmesser, 0)*member.laenge + getLVZValue(lv, "51.5.200", durchmesser, 0)/5
                    member.kosten = price*1.15*member.menge
                }
                else if(lvz == "51.6")
                {
                    price = getLVZValue(lv, "51.6.100", durchmesser, 0)*member.laenge + getLVZValue(lv, "51.6.200", durchmesser, 0)/5
                    member.kosten = price*1.15*member.menge
                }
                if(lvz != "Ingenieurmaessige Begutachtung")
                {
                    member.kosten = Math.ceil(member.kosten*10)/10
                }
            }
        }
    }
}
    