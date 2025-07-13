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

export function abbruch_system(inspection, kante, reparatur_abbruch, teilerneuerung_abbruch)
{
    const vorarbeit = ["2.1", "2.2", "3.1", "3.2", "3.8", "5.1","11.1", "12.1","13.1","14.1","15.1","18.1","22.1"]
    const teilerneuerung_lvz = ["16.1", "16.2", "16.3", "16.4", "16.5", "16.6"]
    let reparatur = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === "Reparatur").benoetigte_arbeiten
    let max_L = 0.02
    const total_L = get(kante.haltungslaenge)
    // finding the maximum length
    for(const element of reparatur)
    {
        if(check_true(vorarbeit, element.lvz) == false)
        {
            if(element.laenge > max_L)
            {
                max_L = element.laenge
            }
        }
    }
    if(max_L >= ((reparatur_abbruch-1)*total_L/100))
    {
        inspection.dynamischer_KV.rep_ern = "nicht Wirtschaftlich"
    }
    // finding the total length of the entire cleaning
    else
    {
        const margin_left = 0
        let margin_right = 0
        let once = true
        for(let i=0; i<reparatur.length; i++)
        {
            if(check_true(vorarbeit, reparatur[i].lvz) == false && once)
            {
                margin_right = reparatur[i].station_bis
                max_L = reparatur[i].laenge
                once = false
            }
        }
        for(let i=0; i<reparatur.length; i++)
        {
            if(check_true(vorarbeit, reparatur[i].lvz) == false)
            {
                const j = i + 1
                if(j<reparatur.length)
                {
                    if(reparatur[j].station_von >= margin_left && reparatur[j].station_von<= margin_right && reparatur[j].station_bis > margin_right)
                    {
                        max_L += reparatur[j].station_bis - margin_right
                        margin_right = reparatur[j].station_bis
                    }
                }
            }
        }
        if(max_L >= (reparatur_abbruch*total_L/100))
        {
            inspection.dynamischer_KV.rep_ern = "nicht Wirtschaftlich"
        }
    }
    if(max_L < (reparatur_abbruch*total_L/100))
    {
        max_L = 0
        for(const element of reparatur)
        {
            if(check_true(teilerneuerung_lvz, element.lvz))
            {
                max_L += element.laenge // Länge von Teilerneuerung
            }
        }
        if(max_L >= (teilerneuerung_abbruch*total_L/100))
        {
            inspection.dynamischer_KV.rep_ern = "nicht Wirtschaftlich"
        }
    }
}