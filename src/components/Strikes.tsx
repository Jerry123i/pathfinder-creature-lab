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
    NullableValueChange, type ValueHolder, compareDamageRollInfo
} from "./StatBlock.tsx";
import {printTraitsSeparator} from "./Traits.tsx";
import {capitalize} from "./TypeScriptHelpFunctions.tsx";
import type {AbilityName} from "./Abilities.tsx";
import {parseAbilityDescription} from "./Parsing.tsx";
import {PrintDamageTier, PrintStrikeTier} from "./GMValuesMarkers.tsx";
import {damageDiceNumberScale, getScaledDamage, getScaledStrikes} from "../assets/GMTables.tsx";

export interface CreatureItemStrike extends CreatureItem {
    system: StrikeSystem
}

export interface StrikeSystem extends ItemSystem {
    bonus: ValueHolder,
    weaponType?: StringHolder,
    range: { increment: number, max: number },
    damageRolls: Record<string, DamageRollInfo>
    attackEffects?: {custom: string, value: string[]}
    description: {value: string};
}

export function staticModifyAllStrikes(creature: StatBlockProp, hitValue: number, damageValue: number)
{
    const strikes = GetStrikes(creature);

    for (let i = 0, len = strikes.baseStrikes.length; i < len; ++i)
        staticModifyStrike(strikes.baseStrikes[i], hitValue, damageValue);

    for (let i = 0, len = strikes.equipmentStrikes.length; i < len; ++i)
        staticModifyStrike(strikes.equipmentStrikes[i], hitValue, damageValue);
}

export function levelModifyAllStrikes(creature: StatBlockProp, baseCreature:StatBlockProp, targetLevel : number)
{
    const strikes = GetStrikes(creature);
    const baseCreatureStrikes = GetStrikes(baseCreature);

    const baseLevel = baseCreature.system.details.level.value;
    for (let i = 0, len = strikes.baseStrikes.length; i < len; ++i)
    {
        const strike = strikes.baseStrikes[i];
        const baseStrike = baseCreatureStrikes.baseStrikes[i];
        strike.system.bonus.value = getScaledStrikes(baseLevel, targetLevel, baseStrike.system.bonus.value);

        const rawDamage = GetDamagesInfo(strike.system);
        const baseRawDamage = GetDamagesInfo(baseStrike.system);
        
        if (rawDamage.length === 1)
        {
            const baseDamage = GetDice(baseRawDamage[0]);
            const targetDamage = getScaledDamage(baseLevel, targetLevel, baseStrike);
            const baseDiceNumber = damageDiceNumberScale[baseLevel+1];
            let targetDiceNumber = damageDiceNumberScale[targetLevel+1];
            
            targetDiceNumber += (baseDamage.diceNumber??0) - baseDiceNumber;
            const staticDamage = Math.floor(targetDamage - targetDiceNumber*(0.5 + (baseDamage.diceType??0)/2));
            
            rawDamage[0].damage = DiceString({ diceType:baseDamage.diceType, diceNumber:targetDiceNumber, modifier: staticDamage })
        }
        else
        {
            const targetDamage = getScaledDamage(baseLevel, targetLevel, baseStrike);
            let alreadyAlocatedDamage = 0;
            
            // Separate instances with and without modifiers
            const instancesWithoutModifier: number[] = [];
            const instancesWithModifier: number[] = [];
            
            for (let j = 0, len = baseRawDamage.length; j < len; ++j)
            {
                const baseDice = GetDice(baseRawDamage[j]);
                if ((baseDice.modifier ?? 0) === 0)
                    instancesWithoutModifier.push(j);
                else
                    instancesWithModifier.push(j);
            }
            
            // Process instances without modifiers first
            for (const j of instancesWithoutModifier)
            {
                const baseDice = GetDice(baseRawDamage[j]);
                const instanceDamage = baseDice.modifier + ((baseDice.diceNumber??0)*((baseDice.diceType??0)/2 + 0.5));
                const instanceProportion = instanceDamage / getDamageAverage(baseStrike);
                const instanceTargetDamage = targetDamage * instanceProportion;
                
                // Find best dice combination with same dice type
                const originalDiceType = baseDice.diceType ?? 4;
                let bestDiceNumber = 0;
                let bestDiceType = originalDiceType;
                let bestDamage = 0;
                let bestDifference = Infinity;
                
                // Try different dice numbers with original dice type
                for (let diceNum = 0; diceNum <= 20; ++diceNum)
                {
                    const testDamage = diceNum * (0.5 + originalDiceType / 2);
                    const difference = Math.abs(testDamage - instanceTargetDamage);
                    if (difference < bestDifference)
                    {
                        bestDifference = difference;
                        bestDiceNumber = diceNum;
                        bestDiceType = originalDiceType;
                        bestDamage = testDamage;
                    }
                }
                
                // If difference > 10%, try different dice types (d4 to d12)
                if (bestDifference > instanceTargetDamage * 0.1)
                {
                    const diceTypes = [4, 6, 8, 10, 12];
                    for (const diceType of diceTypes)
                    {
                        for (let diceNum = 0; diceNum <= 20; ++diceNum)
                        {
                            const testDamage = diceNum * (0.5 + diceType / 2);
                            const difference = Math.abs(testDamage - instanceTargetDamage);
                            if (difference < bestDifference)
                            {
                                bestDifference = difference;
                                bestDiceNumber = diceNum;
                                bestDiceType = diceType;
                                bestDamage = testDamage;
                            }
                        }
                    }
                }
                
                // Update the damage instance with best values
                const updatedDice = GetDice(rawDamage[j]);
                updatedDice.diceType = bestDiceType;
                updatedDice.diceNumber = bestDiceNumber;
                updatedDice.modifier = 0;
                rawDamage[j].damage = DiceString(updatedDice);
                
                alreadyAlocatedDamage += bestDamage;
            }
            
            // Process instances with modifiers
            for (const j of instancesWithModifier)
            {
                const baseDice = GetDice(baseRawDamage[j]);
                const instanceDamage = baseDice.modifier + ((baseDice.diceNumber??0)*((baseDice.diceType??0)/2 + 0.5));
                const instanceProportion = instanceDamage / getDamageAverage(baseStrike);
                const instanceTargetDamage = targetDamage * instanceProportion;
                
                // Calculate expected dice number (like lines 63-66)
                const baseDiceNumber = damageDiceNumberScale[baseLevel+1];
                let targetDiceNumber = damageDiceNumberScale[targetLevel+1];
                targetDiceNumber += (baseDice.diceNumber??0) - baseDiceNumber;
                
                // Calculate static damage
                const diceAverage = targetDiceNumber * (0.5 + (baseDice.diceType??0) / 2);
                const staticDamage = instanceTargetDamage - diceAverage;
                
                // Update the damage instance
                const updatedDice = GetDice(rawDamage[j]);
                updatedDice.diceNumber = targetDiceNumber;
                updatedDice.modifier = Math.floor(staticDamage);
                rawDamage[j].damage = DiceString(updatedDice);
                
                alreadyAlocatedDamage += diceAverage + updatedDice.modifier;
            }
            
            // Distribute remaining damage equally on modifiers of instances with modifiers
            const remainingDamage = targetDamage - alreadyAlocatedDamage;
            if (remainingDamage !== 0 && instancesWithModifier.length > 0)
            {
                const damagePerInstance = Math.floor(remainingDamage / instancesWithModifier.length);
                const extraDamage = Math.floor(remainingDamage - (damagePerInstance * instancesWithModifier.length));
                
                for (let i = 0; i < instancesWithModifier.length; ++i)
                {
                    const j = instancesWithModifier[i];
                    const updatedDice = GetDice(rawDamage[j]);
                    updatedDice.modifier += damagePerInstance;
                    // Add extra damage to the first instance
                    if (i === 0)
                        updatedDice.modifier += extraDamage;
                    rawDamage[j].damage = DiceString(updatedDice);
                }
            }
        }
    }
    
    //TODO equipment strikes
    
}

function staticModifyStrike(strike: CreatureItem, hitValue: number, damageValue: number) 
{
    if (strike.type.toLowerCase() === "equipment") {

        for (const rule of strike.system.rules) {
            if (rule.key.toLowerCase() === "strike") {
                if (rule.attackModifier !== undefined)
                    rule.attackModifier += hitValue;

                let dmgType = "";
                if (rule.damage === undefined)
                    dmgType = "";
                else 
                    dmgType = rule.damage.base.damageType;
                
                strike.system.rules.push(
                    {
                        damageType: dmgType,
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

    NullableValueChange(strikeAtk.system.bonus, hitValue);
    
    const rawDamage = GetDamagesInfo(strikeAtk.system);

    for (let j = 0, lenj = rawDamage.length; j < lenj; ++j) {
        if (j > 0)
            break;
        const damage = GetDice(rawDamage[j]);
        damage.modifier += damageValue;

        rawDamage[j].damage = DiceString(damage);
    }
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

export function GetDamagesInfo(value: StrikeSystem): DamageRollInfo[] {
    const roll = value.damageRolls!;
    const keys = Object.keys(roll);

    const damages: DamageRollInfo[] = [];

    for (const key of keys) {
        const damageRoll = roll[key] as DamageRollInfo;
        damages.push(damageRoll);
    }

    const physical = ["slashing", "bludgeoning", "piercing"];
    
    damages.sort((a,b) => {
        const score = (x : DamageRollInfo) =>
            (physical.includes(x.damageType) ? 2 : 0) +
            (x.damage.includes("d") ? 1 : 0);

        return score(b) - score(a);
    });
    
    return damages;
}

export function PrintStrike(creature: StatBlockProp,item: CreatureItem, showTier :boolean){
    
    if (item.type === "melee")
        return PrintStrike_StrikeType(creature, item as CreatureItemStrike, showTier);
    
    if (item.type === "equipment")
        return PrintStrike_EquipmentType(creature, item, showTier);
    
    return <></>;
}

export function PrintStrike_StrikeType(creature: StatBlockProp,item: CreatureItemStrike, showTier : boolean) {
    if (item.system.weaponType === undefined) {
        item.system.weaponType = {value: "melee"};

        if (item.system.range !== undefined) {
            if (item.system.range?.increment > 0)
                item.system.weaponType = {value: "ranged"};
        }
    }

    const level = creature.system.details.level.value;
    
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
                if (i>0)
                    attackEffectsString += " and ";
                attackEffectsString += GetAbilityNameFromSlug(creature, item.system.attackEffects.value[i]);
            }
        }
            
    }
    
    return (<>
        <b>{isThrow(item)?"Ranged":capitalize(item.system.weaponType.value)}</b> <span className="pathfinder-action">A</span>{item.name} {printNumberWithSignalElement(item.system.bonus.value)}{showTier?PrintStrikeTier(level, item.system.bonus.value):null}[{printNumberWithSignalElement((item.system.bonus.value ?? 0) - atkPenalty)}/{printNumberWithSignalElement((item.system.bonus.value??0) - (atkPenalty * 2))}]
        {" "}{traits.value.length > 0 && <>({printTraitsSeparator(traits, ", ")})</>} {GetDamagesInfo(item.system).map(dmg => (<> {dmg.damage} {dmg.category && dmg.category+" "}{dmg.damageType}</>))}{showTier?PrintDamageTier(level, item):null} {attackEffectsString !== "" && <span className="text-green-800 italic"> {attackEffectsString}</span>} <span className="text-gray-500 italic" dangerouslySetInnerHTML={{__html: parseAbilityDescription(item.system.description.value.replace("<p>", "").replace("</p>",""))}}></span>
    </>)
}

export function PrintStrike_EquipmentType(creature: StatBlockProp,item: CreatureItem, showTier : boolean){

    let atkPenalty = 5;

    const traits = item.system.traits;
    if (traits.value.includes("agile"))
        atkPenalty = 4;

    const level = creature.system.details.level.value;
    
    let bonus = 0;
    const damages : string[] = [];
    
    let baseDamageStablished = false;
    
    for (const rule of item.system.rules)
    {
        if (rule.key.toLowerCase() === "strike" && !baseDamageStablished)
        {
            bonus = (rule.attackModifier ?? 0);
            const numberDice = (rule.damage?.base.dice.toString() ?? "null"); 
            damages.push(numberDice+rule.damage?.base.die+` ${rule.damage?.base.damageType} damage`);
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
        <b>{capitalize("Melee")}</b> <span className="pathfinder-action">A</span>{item.name} {printNumberWithSignalElement(bonus)}{showTier?PrintStrikeTier(level, bonus):null}[{printNumberWithSignalElement(bonus - atkPenalty)}/{printNumberWithSignalElement(bonus - (atkPenalty * 2))}]
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
                staticModifyStrike(strike, value, 0);
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
                
                staticModifyStrike(strike, 0, propulsiveValue);
                continue;
            }
            
            if (thrown) {
                const hit = hasBrutal ? value : 0;
                staticModifyStrike(strike, hit, value);
                continue;
            }

            const strEligible =
                (isRanged && hasBrutal) ||
                isMelee;

            if (strEligible) {
                const hit = hasFinesse ? 0 : value;
                staticModifyStrike(strike, hit, value);
            }
        }
    }

    for (const strike of strikes.equipmentStrikes)
    {
        if (ability === "str")
            staticModifyStrike(strike, value,value);
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

export function PrintReactiveStrikeLabel(value: StatBlockProp)
{
    const reactiveStrike = getReactiveStrike(value);
    
    if (reactiveStrike === undefined)
        return <></>;
    
    if (reactiveStrike.name === "Reactive Strike" || reactiveStrike.name === "Attack of Opportunity")
        return <>
            (<span className="text-s flex items-center gap-1">
                {(<span className="text-s "><span className="pathfinder-action text-[1.25rem] leading-none">R</span><span className="font-semibold">Reactive Strike</span></span>)}
            </span>)
            </>
    
    else
        return <>
            (<span className="text-s flex items-center gap-1">
                {(<span className="text-s "><span className="pathfinder-action text-[1.25rem] leading-none">R</span><span className="font-semibold">{reactiveStrike.name}</span></span>)}
            </span>)
            </>
}

export function getStrongerStrike(value: StatBlockProp): CreatureItemStrike | undefined
{
    const strikes = GetStrikes(value).baseStrikes;
    if (strikes.length === 0)
        return undefined;
    
    return strikes.sort((a, b) => {return a.system.bonus.value - b.system.bonus.value;})[strikes.length-1];    
}

export function getWeakestStrike(value: StatBlockProp): CreatureItemStrike | undefined
{
    const strikes = GetStrikes(value).baseStrikes;
    if (strikes.length === 0)
        return undefined;

    return strikes.sort((a, b) => {return a.system.bonus.value - b.system.bonus.value;})[0];
}

export function getDamageAverage(input: CreatureItemStrike): number
{
    const roll = input.system.damageRolls;
    const keys = Object.keys(roll);

    const damages: DamageRollInfo[] = [];

    let value = 0;
    
    for (const key of keys) {
        const damageRoll = roll[key] as DamageRollInfo;
        damages.push(damageRoll);
    }
    
    for (const damage of damages)
    {
        const dice = GetDice(damage);
        value += dice.modifier;
        value += (((dice.diceType??0)+1)/2)*(dice.diceNumber??1);
    }
    
    return value;
    
}

function getReactiveStrike(value: StatBlockProp): CreatureItem | undefined
{
    const reactiveStrike = value.items.filter(v => {return v.system.slug === "reactive-strike" || v.system.slug === "attack-of-opportunity"});
    if (reactiveStrike.length === 0)
        return undefined;
    
    return reactiveStrike[0];
}