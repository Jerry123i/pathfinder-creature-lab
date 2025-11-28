import {
    cloneStatBlock,
    GetGenericAbilities,
    modifyAllSaves,
    type StatBlockProp,
    type TypedValue
} from "../StatBlock.tsx";
import {modifyAllStrikes} from "../Strikes.tsx";
import {modifyAllSkills} from "../Skills.tsx";
import {modifySpellDc} from "../Spells.tsx";
import {
    Catfolk,
    Dwarf,
    Elf,
    Gnome,
    Goblin,
    Halfling,
    Leshy,
    Merfolk,
    Minotaur,
    Orc,
} from "./Ancestry/AncestryModifiers.tsx";
import {actionTooltipRegex, checkRegex, damageRegex, splitDamageDiceRegex} from "../Parsing.tsx";
import {capitalize} from "../TypeScriptHelpFunctions.tsx";

type ModifierType = "Level" | "Ancestry" | "Elemental" | "Undead" | "CreatureType";

export interface CreatureAdjustment {
    _id: string;
    description: string;
    name: string;
    priority: number;
    type : ModifierType;

    apply: (statblock: StatBlockProp) => StatBlockProp;
}

export const Elite : CreatureAdjustment = {
    _id: "adj_elite",
    name: "Elite",
    description: "Sometimes you’ll want a creature that’s just a bit more powerful than normal so that you can present a challenge that would otherwise be trivial or show that one enemy is stronger than its kin.", 
    priority: 9,
    type: "Level",
    apply: (statblock: StatBlockProp) =>
    {

        const sb = cloneStatBlock(statblock);
        const initLevel = statblock.system.details.level.value;
        sb.system.details.level.value += (initLevel < 1) ? 2 : 1;
        sb.system.attributes.ac.value += 2;
        modifyAllSaves(sb.system, 2);
        sb.system.perception.mod += 2;
        modifyAllSkills(sb ,sb.system, 2);
        let hpIncreaseValue = 30;
        
        if (initLevel <= 1)
            hpIncreaseValue = 10;
        else if (initLevel <= 4)
            hpIncreaseValue = 15;
        else if (initLevel <= 19)
            hpIncreaseValue = 20;
        else 
            hpIncreaseValue = 30;
        
        sb.system.attributes.hp.value += hpIncreaseValue;
        modifyAllStrikes(sb, 2, 2);
        modifySpellDc(sb, 2);
        modifyAbilitiesSaves(sb, 2);
        modifyAbilitiesDamage(sb, 2);
        
        sb.name = "Elite " + sb.name;
        
        return sb;
    }
}

export const Weak : CreatureAdjustment = {
    _id: "adj_weak",
    name: "Weak",
    description: "Sometimes you’ll want a creature that’s weaker than normal so you can use a creature that would otherwise be too challenging or show that one enemy is weaker than its kin.",
    priority: 9,
    type: "Level",
    apply: (statblock: StatBlockProp) =>
    {
        const sb = cloneStatBlock(statblock);
        const initLevel = statblock.system.details.level.value;
        sb.system.details.level.value -= (initLevel === 1) ? 2 : 1;
        sb.system.attributes.ac.value -= 2;
        modifyAllSaves(sb.system, -2);
        sb.system.perception.mod -= 2;
        modifyAllSkills(sb,sb.system, -2);
        let hpDecreaseValue = 0;

        if (initLevel < 1)
            hpDecreaseValue = 0;        
        else if (initLevel <= 2)
            hpDecreaseValue = 10;
        else if (initLevel <= 5)
            hpDecreaseValue = 15;
        else if (initLevel <= 20)
            hpDecreaseValue = 20;
        else 
            hpDecreaseValue = 30;

        sb.system.attributes.hp.value -= hpDecreaseValue;
        modifyAllStrikes(sb, -2, -2);
        modifySpellDc(sb, -2);
        modifyAbilitiesSaves(sb, -2);
        modifyAbilitiesDamage(sb, -2);

        sb.name = "Weak " + sb.name;
        
        return sb;
    }
}

export const Zombie : CreatureAdjustment = {
    _id: "adj_zombie",
    name: "Zombie",
    description: "",
    priority: 1,
    type: "Undead",
    apply: (statblock: StatBlockProp) =>
    {
        const sb = cloneStatBlock(statblock);

        sb.name = "Zombie " + sb.name;

        return sb;
    }
}

export const Vampire : CreatureAdjustment = {
    _id: "adj_vampire",
    name: "Vampire",
    description: "",
    priority: 1,
    type: "Undead",
    apply: (statblock: StatBlockProp) =>
    {
        const sb = cloneStatBlock(statblock);

        sb.name = "Vampire " + sb.name;

        return sb;
    }
}

export function applyAllAdjustments(baseCreature : StatBlockProp | undefined, adjustments : CreatureAdjustment[]) : StatBlockProp | undefined
{
    if(baseCreature === undefined)
        return undefined;
    
    if (adjustments.length === 0)
        return  baseCreature;
    
    let creature = cloneStatBlock(baseCreature);

    adjustments.sort((a,b)=> a.priority-b.priority);
    
    for (let i = 0; i < adjustments.length; i++) {
        creature = adjustments[i].apply(creature);
    }
    
    return creature;
}

export function addLanguages(baseCreature : StatBlockProp, language: string, addOnlyIfSpeaks : boolean) : StatBlockProp
{
    if (addOnlyIfSpeaks && baseCreature.system.details.languages.value.length === 0)
        return baseCreature;

    const sb = cloneStatBlock(baseCreature);
    
    if (sb.system.details.languages.value.includes(language))
        return sb;
    
    sb.system.details.languages.value.push(language)    
    return sb;
}

export function addSpeed(baseCreature : StatBlockProp, value: TypedValue)
{
    for (const speed of baseCreature.system.attributes.speed.otherSpeeds)
    {
        if (speed.type == value.type)
        {
            if (speed.value < value.value)
                speed.value = value.value;
            
            return;
        }
    }
    
    baseCreature.system.attributes.speed.otherSpeeds.push(value);
}

export function changeSize(baseCreature : StatBlockProp, value: ("tiny"|"small"|"medium"|"large"|"huge"|"gargantuan")) : StatBlockProp
{
    if (baseCreature.system.traits.value.includes("troop"))
        return baseCreature;
    
    const sb = cloneStatBlock(baseCreature);
    sb.system.traits.size.value = value;
    return sb;
}

export function modifyAbilitiesSaves(creature : StatBlockProp, value : number)
{
    const abilities = GetGenericAbilities(creature);

    for (const ability of abilities)
    {
        let desc = ability.system.description.value;

        desc = desc.replace(checkRegex, (_match, save, dc) => {
            if (dc === undefined) return _match;
            return _match.replace(dc, (parseInt(dc) + value).toString());
        });

        desc = desc.replace(actionTooltipRegex, (_match, text, dc) => {
            if (dc === undefined) return _match;
            return _match.replace(dc, (parseInt(dc) + value).toString());
        });

        ability.system.description.value = desc;
    }
}

export function modifyAbilitiesDamage(creature : StatBlockProp, valueToIncrease : number)
{
    const abilities = GetGenericAbilities(creature);

    for (const ability of abilities) 
    {
        let desc = ability.system.description.value;
        desc = desc.replace(damageRegex, (_match, damageInfoMatch) => 
            {
                const split = damageInfoMatch.toString().split(/(?<=\]),/);
                let roll: { dice: string, dmgType1: string, dmgType2: string };

                let damageInstance = split[0] as string;
                damageInstance = damageInstance.replace(splitDamageDiceRegex, (_matchJ, dice) =>
                    {
                        const diceRegex = /\d+d\d+((?:\+|-?)\d+)?/;
                        const flatNumberRegex = /((?:\d+))(?:(?:\+|-?)\d+)?/;
                        
                        const diceMatch = dice.match(diceRegex); 
                        if(diceMatch)
                        {
                            //if(diceMatch.match[1] === undefined)
                            if(diceMatch[1] === undefined)
                            {
                                if (valueToIncrease > 0)
                                    return _matchJ.replace(dice, dice.toString() + "+" + valueToIncrease.toString());
                                else
                                    return _matchJ.replace(dice, dice.toString() + valueToIncrease.toString());
                            }
                            else
                            {
                                const newValue = parseInt(diceMatch[1]) + valueToIncrease;
                                //// const newDice  = diceMatch.replace(diceMatch[1], newValue.toString());
                                const newDice = dice.replace(diceRegex, (_m) =>{
                                    return _m.replace(diceMatch[1], (newValue>0?"+":"")+(newValue.toString()));
                                })
                                return _matchJ.replace(dice, newDice.toString());
                            }
                        }
                        else
                        {
                            const flatNumberMatch = dice.match(flatNumberRegex);
                            if(flatNumberMatch)
                            {
                                const newValue = parseInt(flatNumberMatch[1]) + valueToIncrease;
                                return _matchJ.replace(dice, newValue.toString());
                            }
                        }
                        
                        return _matchJ.replace(dice, dice + "+error");
                    }
                );

                return _match.replace(split[0], damageInstance);
            }
        )
        ability.system.description.value = desc;
    }
}

export const CreatureAdjustmentList = [Elite, Weak, Catfolk, Dwarf, Elf, Gnome, Goblin, Halfling, Leshy, Minotaur, Merfolk, Orc];