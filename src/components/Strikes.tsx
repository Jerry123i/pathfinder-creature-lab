import {
    type CreatureItem,
    type DamageRollInfo,
    DiceString,
    GetAbilityNameFromSlug,
    GetDice,
    type ItemSystem,
    printNumberWithSignalElement,
    type StatBlockProp,
    type StringHolder,
    type ValueHolder
} from "./StatBlock.tsx";
import {printTraitsSeparator} from "./Traits.tsx";
import {capitalize} from "./TypeScriptHelpFunctions.tsx";
import type {AbilityName} from "./Abilities.tsx";

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


function modifyStrike(strike: CreatureItem, hitValue: number, damageValue: number) 
{
    if (strike.type.toLowerCase() === "equipment") {

        for (const rule of strike.system.rules) {
            if (rule.key.toLowerCase() === "strike") {
                if (rule.attackModifier !== undefined)
                    rule.attackModifier += hitValue;

                strike.system.rules.push(
                    {
                        damageType: rule.damage.base.damageType,
                        key: "FlatModifier",
                        predicate: rule.predicate,
                        selector: "{item|_id}-damage",
                        value: damageValue
                    }
                );

                break
            }
        }
        return;
    }


    const strikeAtk = strike as CreatureItemStrike;

    strikeAtk.system.bonus.value += hitValue;
    const rawDamage = GetDamagesInfo(strikeAtk.system);

    for (let j = 0, lenj = rawDamage.length; j < lenj; ++j) {
        if (j > 0)
            break;
        const damage = GetDice(rawDamage[j]);
        damage.modifier += damageValue;

        rawDamage[j].damage = DiceString(damage);
    }
}

export function modifyAllStrikes(creature: StatBlockProp, hitValue: number, damageValue: number) {

    const strikes = GetStrikes(creature);
    
    for (let i = 0, len = strikes.baseStrikes.length; i < len; ++i)
        modifyStrike(strikes.baseStrikes[i], hitValue, damageValue);

    for (let i = 0, len = strikes.equipmentStrikes.length; i < len; ++i)
        modifyStrike(strikes.equipmentStrikes[i], hitValue, damageValue);
}

export function GetStrikes(value: StatBlockProp): {baseStrikes : CreatureItemStrike[], equipmentStrikes: CreatureItem[]}
{

    const meleeTag = value.items.filter(item => item.type === "melee") as CreatureItemStrike[];
    const equipment = GetStrikesFromEquipment(value);
    
    return {baseStrikes: meleeTag, equipmentStrikes: equipment};
    
}

export function GetCombinedStrikes(value: {baseStrikes : CreatureItemStrike[], equipmentStrikes: CreatureItem[]}) : CreatureItem[]{
    return [...value.baseStrikes, ...value.equipmentStrikes];
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
        <b>{isThrow(item)?"Ranged":capitalize(item.system.weaponType.value)}</b> <span className="pathfinder-action">A</span>{item.name} {printNumberWithSignalElement(item.system.bonus.value)}[{printNumberWithSignalElement(item.system.bonus.value - atkPenalty)}/{printNumberWithSignalElement(item.system.bonus.value - (atkPenalty * 2))}]
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

export function ModifyStrikesByAbility(creature: StatBlockProp, ability: AbilityName, value: number)
{
    if (ability !== "str" && ability !== "dex")
        return;
    
    const strikes = GetStrikes(creature);

    for (const strike of strikes.baseStrikes) {
        const weaponType = strike.system.weaponType?.value.toLowerCase();
        const traits = strike.system.traits.value;
        const isRanged = weaponType === "ranged";
        const isMelee = weaponType === "melee";
        const hasFinesse = traits.includes("finesse");
        const hasBrutal = traits.includes("brutal");
        const isPropulsive = traits.includes("propulsive");
        const thrown = isThrow(strike);
        
        
        if (ability === "dex") {
            const dexEligible =
                (isRanged && !hasBrutal) ||
                (isMelee && hasFinesse) ||
                thrown;

            if (dexEligible) {
                modifyStrike(strike, value, 0);
            }
            continue;
        }

        if (ability === "str")
        {
            if (isPropulsive) //TODO negative values
            {
                let propulsiveValue = Math.floor(value/2);
                if (creature.system.abilities.str.mod % 2 === 0 && value % 2 !== 0)
                    propulsiveValue += 1;
                
                modifyStrike(strike, 0, propulsiveValue);
                continue;
            }
            
            if (thrown) {
                const hit = hasBrutal ? value : 0;
                modifyStrike(strike, hit, value);
                continue;
            }

            const strEligible =
                (isRanged && hasBrutal) ||
                isMelee;

            if (strEligible) {
                const hit = hasFinesse ? 0 : value;
                modifyStrike(strike, hit, value);
            }
        }
    }

    for (const strike of strikes.equipmentStrikes)
    {
        if (ability === "str")
            modifyStrike(strike, value,value);
    }
    
}

function isThrow(value: CreatureItemStrike) : boolean
{
    for (const trait of value.system.traits.value)
    {
        if (trait.toLowerCase().includes("thrown"))
            return true;
    }    
    
    return false;
}