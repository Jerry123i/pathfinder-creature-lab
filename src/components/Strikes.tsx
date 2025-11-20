import {
    type DamageRollInfo,
    DiceString,
    GetDice,
    type ItemSystem,
    type StatBlockProp,
    type StringHolder,
    type ValueHolder,
    printNumberWithSignalElement, type CreatureItem, GetAbilityNameFromSlug
} from "./StatBlock.tsx";
import {printTraitsSeparator, printTraitsTransform} from "./Traits.tsx";
import {capitalize} from "./TypeScriptHelpFunctions.tsx";

export interface CreatureItemStrike extends CreatureItem {
    system: StrikeSystem
}

export interface StrikeSystem extends ItemSystem {
    bonus: ValueHolder,
    weaponType?: StringHolder,
    range: { increment: number, max: number },
    damageRolls: Record<string, DamageRollInfo>
    attackEffects?: {custom: string, value: string[]}
}



export function modifyAllStrikes(creature: StatBlockProp, hitValue: number, damageValue: number) {
    const strikes = GetStrikes(creature);

    for (let i = 0, len = strikes.length; i < len; ++i) {
        strikes[i].system.bonus.value += hitValue;
        const rawDamage = GetDamagesInfo(strikes[i].system);

        for (let j = 0, lenj = rawDamage.length; j < lenj; ++j) {
            if (j > 0)
                break;
            const damage = GetDice(rawDamage[j]);
            damage.modifier += damageValue;

            rawDamage[j].damage = DiceString(damage);
        }
    }
}

export function GetStrikes(value: StatBlockProp): CreatureItemStrike[] {

    return value.items.filter(item => item.type === "melee") as CreatureItemStrike[];
}

function GetDamagesInfo(value: StrikeSystem): DamageRollInfo[] {
    const roll = value.damageRolls!;
    const keys = Object.keys(roll);

    const damages: DamageRollInfo[] = [];

    for (const key of keys) {
        const damageRoll = roll[key] as DamageRollInfo;
        damages.push(damageRoll);
    }

    return damages;
}

export function PrintStrike(creature: StatBlockProp,item: CreatureItemStrike) {
    if (item.system.weaponType === undefined) {
        item.system.weaponType = {value: "melee"};

        if (item.system.range !== undefined) {
            if (item.system.range?.increment > 0)
                item.system.weaponType = {value: "ranged"};
        }

    }

    let atkPenalty: number;
    atkPenalty = 5;

    const traits = item.system.traits;
    traits.value = traits.value.filter(item => {return item !== "unarmed"})
    
    if (traits.value.includes("agile"))
        atkPenalty = 4;

    let attackEffectsString = "";
    
    if (item.system.attackEffects !== undefined) 
    {
        if (item.system.attackEffects.value.length !== 0)
        {
            attackEffectsString = "plus ";
            
            for (let i = 0; i < item.system.attackEffects.value.length; i++) {
                attackEffectsString += GetAbilityNameFromSlug(creature, item.system.attackEffects.value[i]);
            }
        }
            
    }
    
    return (<>
        <b>{capitalize(item.system.weaponType.value)}</b> <span className="pathfinder-action">A</span>{item.name} {printNumberWithSignalElement(item.system.bonus.value)}[{printNumberWithSignalElement(item.system.bonus.value - atkPenalty)}/{printNumberWithSignalElement(item.system.bonus.value - (atkPenalty * 2))}]
        {" "}{traits.value.length > 0 && <>({printTraitsSeparator(traits, ", ")})</>} {GetDamagesInfo(item.system).map(dmg => (<> {dmg.damage} {dmg.damageType}</>))} {attackEffectsString !== "" && <span className="text-green-800 italic"> {attackEffectsString}</span>}
    </>)
}