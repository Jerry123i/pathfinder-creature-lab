import {cloneStatBlock, modifyAllSaves, type StatBlockProp, type TypedValue} from "../StatBlock.tsx";
import {modifyAllStrikes} from "../Strikes.tsx";
import {modifyAllSkills} from "../Skills.tsx";
import {ModifySpellDc} from "../Spells.tsx";
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
        ModifySpellDc(sb, 2);
        
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
        ModifySpellDc(sb, -2);

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
    const sb = cloneStatBlock(baseCreature);
    sb.system.traits.size.value = value;
    return sb;
}

export const CreatureAdjustmentList = [Elite, Weak, Catfolk, Dwarf, Elf, Gnome, Goblin, Halfling, Leshy, Minotaur, Merfolk, Orc];