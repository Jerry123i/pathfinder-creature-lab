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
import {printTraitsSeparator} from "./Traits.tsx";
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
    
    for (let i = 0, len = strikes.length; i < len; ++i)
    {
        if (strikes[i].type.toLowerCase() !== "melee") //TODO
            continue;
        
        const strike = strikes[i] as CreatureItemStrike;
        
        strike.system.bonus.value += hitValue;
        const rawDamage = GetDamagesInfo(strike.system);

        for (let j = 0, lenj = rawDamage.length; j < lenj; ++j) {
            if (j > 0)
                break;
            const damage = GetDice(rawDamage[j]);
            damage.modifier += damageValue;

            rawDamage[j].damage = DiceString(damage);
        }
    }
}

export function GetStrikes(value: StatBlockProp): CreatureItem[] {

    const meleeTag = value.items.filter(item => item.type === "melee");
    const equipment = GetStrikesFromEquipment(value);
    
    return [...meleeTag, ...equipment];
    
}

export function GetStrikesFromEquipment(value: StatBlockProp) : CreatureItem[]
{
    const allEquipment = value.items.filter(item => item.type === "equipment");

    const strikingEquipment : CreatureItem[] = [];
    
    for (const equipment of allEquipment) 
    {
        for (const rule of equipment.system.rules)
        {
            if (rule.key.toLowerCase() === "strike")
            {
                strikingEquipment.push(equipment);
                break;
            }
        }
    }
    
    return strikingEquipment;
    
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

export function PrintStrike(creature: StatBlockProp,item: CreatureItemStrike){
    
    if (item.type === "melee")
        return PrintStrike_StrikeType(creature, item);
    
    if (item.type === "equipment")
        return PrintStrike_EquipmentType(creature,item);
    
    return <></>;
}

export function PrintStrike_StrikeType(creature: StatBlockProp,item: CreatureItemStrike) {
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

export function PrintStrike_EquipmentType(creature: StatBlockProp,item: CreatureItemStrike){

    let atkPenalty = 5;

    const traits = item.system.traits;
    if (traits.value.includes("agile"))
        atkPenalty = 4;
    
    let bonus = 0;
    const damages : string[] = [];
    
    let baseDamageStablished = false;
    
    for (const rule of item.system.rules)
    {
        if (rule.key.toLowerCase() === "strike" && !baseDamageStablished){
            bonus = rule.attackModifier;
            damages.push(rule.damage?.base.dice.toString()+rule.damage?.base.die+` ${rule.damage?.base.damageType} damage`);
            baseDamageStablished = true;
        }
        if (rule.key.toLowerCase() === "flatmodifier"){
            damages.push(rule.value.toString() + ` ${rule.damageType} damage`);
        }
    }
    
    let damageString = "";

    for (let i = 0; i < damages.length; i++)
        damageString += `${i === 0?"":" plus "}${damages[i]}`;    
    
    return (<>
        <b>{capitalize("Melee")}</b> <span className="pathfinder-action">A</span>{item.name} {printNumberWithSignalElement(bonus)}[{printNumberWithSignalElement(bonus - atkPenalty)}/{printNumberWithSignalElement(bonus - (atkPenalty * 2))}]
        <> {damageString}</>
        {/*{" "}{traits.value.length > 0 && <>({printTraitsSeparator(traits, ", ")})</>}*/}
        {/*{GetDamagesInfo(item.system).map(dmg => (<> {dmg.damage} {dmg.damageType}</>))} {attackEffectsString !== "" && <span className="text-green-800 italic"> {attackEffectsString}</span>}*/}
    </>)
    
}