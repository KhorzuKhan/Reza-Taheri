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
export function SubKanS(inspection, kante, abnutzung, zustandsklasse, zk_bis, Durchmesser_Grenze, abnutzung_bis, abnutzung_ab)
{
    const dn = Number(get(kante.profil.profilbreite))
    let abz_grenze = 0
    if(dn<= Durchmesser_Grenze)
    {
        abz_grenze = abnutzung_bis

    }else
    {
        abz_grenze = abnutzung_ab
    }
    if(zustandsklasse > zk_bis)
    {
        inspection.masnahmen.empfohlene_masnahme = "keine Massnahmen"
    }else if(abnutzung > abz_grenze || inspection.dynamischer_KV.rep_ern == "nicht Wirtschaftlich")
    {
        inspection.masnahmen.empfohlene_masnahme = "Renovierung"
    }else if(abnutzung <= abz_grenze)
    {
        inspection.masnahmen.empfohlene_masnahme = "Reparatur"
    }
}