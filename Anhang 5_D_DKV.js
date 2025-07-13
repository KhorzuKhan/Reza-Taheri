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
export function DKV( inspection, ND_REP, ND_REN, ND_ERN, proz_zins, real_zins, schadenszunahme)
{
    if(inspection.sanierung_haltung == "erforderlich")
    {
        inspection.dynamischer_KV = {"rep_ern": [], "ren_ern": [], "ern_ern": []}
        function DFAKE(x,n)
        {
            const ans = 1/(1+x/100)**n
            return ans
        }
        function AFAKE(x,n)
        {
            const ans = (1+x/100)**n
            return ans
        }
        const rep = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === "Reparatur")
        const ren = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === "Renovierung")
        const ern = inspection.masnahmen.moegliche_masnahmen.find(user => user.name === "Erneuerung")
        const IK_reparatur = rep.benoetigte_arbeiten
        const IK_renovierung = ren.benoetigte_arbeiten
        const IK_erneuerung = ern.benoetigte_arbeiten
        // region Reparatur
        let j = 0
        let IK_neu = 0
        let n = 0
        let Kostenbarwert = 0
        let Total_KBW = 0
        let price = 0
        let ernkosten = IK_erneuerung[0].kosten
        for( const member of IK_reparatur)
        {
            if(member.kosten == "kein Preis: ING")
            {
                price += 650 // random number
            }else
            {
                price += member.kosten
            }
        }
        for( let i=0; i<4; i++)
        {
            IK_neu = price*((1+schadenszunahme/100)**j)
            j++
            n = i*ND_REP
            Kostenbarwert = IK_neu*DFAKE(real_zins, n)*AFAKE(proz_zins, n)
            Total_KBW += Kostenbarwert 
        }
        n = 4*ND_REP
        inspection.dynamischer_KV.rep_ern = Math.round((Total_KBW + ernkosten*DFAKE(real_zins, n)*AFAKE(proz_zins, n))*10)/10
    
        //region Renovierung
        for( const member of IK_renovierung)
        {
            if(member.kosten == "kein Preis: ING")
            {
                price += 650
            }else
            {
                price += member.kosten
            }
        }
        IK_neu = price
        n = 0
        Kostenbarwert = IK_neu*DFAKE(real_zins, n)*AFAKE(proz_zins, n) 
        n = ND_REN
        Total_KBW = Kostenbarwert + ernkosten*DFAKE(real_zins, n)*AFAKE(proz_zins, n)
        inspection.dynamischer_KV.ren_ern = Math.round(Total_KBW*10)/10
    
        //region Erneuerung
        n = ND_ERN
        Total_KBW = ernkosten + ernkosten*DFAKE(real_zins, n)*AFAKE(proz_zins, n)
        inspection.dynamischer_KV.ern_ern = Math.round(Total_KBW*10)/10
    }
}