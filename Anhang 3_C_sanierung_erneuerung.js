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

export function sanierung_erneuerung(zustand, inspection, kante)
{
    const menge = 1
    const von = get(zustand[0].station) // This is a programming trick, this value is always zero
    const bis = get(kante.haltungslaenge)
    const laenge = get(kante.haltungslaenge)
    const klasse = 1 // keine Ahnung was es ist, aber muss ein Nummer ausser 0 sein, sonst funktioniert nicht
    const bauweise = "offen"
    const grund = "Erneuerung"
    let flag = true
    let san_ern = {}
    const tiefe = get(kante.mittlere_tiefe)

    const user = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === "Erneuerung")
    const erneuerung = user.benoetigte_arbeiten
    const lvz_liste = ["51.1","51.2","51.3","51.4","51.5","51.6"]
    const mt_liste = [1,2,3,4,5,6]
    if(inspection.sanierung_haltung == "erforderlich")
    {
        if(tiefe>mt_liste[5])
        {
            san_ern={grund, menge, station_von: von, station_bis: bis, laenge, klasse: 3, lvz: "51.6", bauweise}
            erneuerung.push(san_ern) 
        }else
        {
            for( let i=0 ; i<6; i++)
            {
                if(tiefe<mt_liste[i])
                {
                    if(flag)
                    {
                        san_ern={grund, menge, station_von: von, station_bis: bis, laenge, klasse, lvz: lvz_liste[i], bauweise}
                        erneuerung.push(san_ern)
                        flag=false
                    }
                }
            }
        }
    }
}