import {
    cloneStatBlock,
    GetGenericAbilities,
    modifyAllSaves,
    type StatsJson,
    type TypedValue
} from "../StatBlock.tsx";
import {levelModifyAllStrikes, staticModifyAllStrikes} from "../Strikes.tsx";
import {levelModifyAllSkills, staticModifyAllSkills} from "../Skills.tsx";
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
} from "./AncestryModifiers.tsx";
import {actionTooltipRegex, checkRegex, damageRegex, splitDamageDiceRegex} from "../Parsing.tsx";
import {Ghost, Ghoul, Mummy, Shadow, Skeleton, Vampire, Wight, Zombie} from "./UndeadModifiers.tsx";
import type {Resistance} from "../HPItems.tsx";
import {Air, Earth, Fire, Metal, Water, Wood} from "./ElementalModifiers.tsx";
import {
    getScaledArmor,
    getScaledFortitude,
    getScaledHP,
    getScaledPerception,
    getScaledReflex, getScaledWill
} from "../../assets/GMTables.tsx";
import {ModifyAbilitiesByLevel} from "../Abilities.tsx";

type ModifierType = "Level" | "Ancestry" | "Elemental" | "Undead" | "CreatureType";

export interface CreatureAdjustment {
    _id: string;
    description: string;
    name: string;
    priority: number;
    type : ModifierType;

    apply: (statblock: StatsJson) => StatsJson;
}

export const Elite : CreatureAdjustment = {
    _id: "adj_elite",
    name: "Elite",
    description: "Sometimes you’ll want a creature that’s just a bit more powerful than normal so that you can present a challenge that would otherwise be trivial or show that one enemy is stronger than its kin.", 
    priority: 9,
    type: "Level",
    apply: (statblock: StatsJson) =>
    {

        const sb = cloneStatBlock(statblock);
        const initLevel = statblock.system.details.level.value;
        sb.system.details.level.value += (initLevel < 1) ? 2 : 1;
        sb.system.attributes.ac.value += 2;
        modifyAllSaves(sb.system, 2);
        sb.system.perception.mod += 2;
        staticModifyAllSkills(sb ,sb.system, 2);
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
        staticModifyAllStrikes(sb, 2, 2);
        modifySpellDc(sb, 2);
        modifyAbilitiesDcs(sb, 2);
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
    apply: (statblock: StatsJson) =>
    {
        const sb = cloneStatBlock(statblock);
        const initLevel = statblock.system.details.level.value;
        sb.system.details.level.value -= (initLevel === 1) ? 2 : 1;
        sb.system.attributes.ac.value -= 2;
        modifyAllSaves(sb.system, -2);
        sb.system.perception.mod -= 2;
        staticModifyAllSkills(sb,sb.system, -2);
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
        staticModifyAllStrikes(sb, -2, -2);
        modifySpellDc(sb, -2);
        modifyAbilitiesDcs(sb, -2);
        modifyAbilitiesDamage(sb, -2);

        sb.name = "Weak " + sb.name;
        
        return sb;
    }
}

export function applyAllAdjustments(baseCreature : StatsJson | undefined, adjustments : CreatureAdjustment[]) : StatsJson | undefined
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

export function applyLevelAdjustment(baseCreature : StatsJson | undefined, levelVariance : number) : StatsJson | undefined
{
    if (baseCreature === undefined)
        return undefined;
    
    if (levelVariance === undefined)
        return baseCreature;
    
    if (levelVariance === 0)
        return baseCreature;
    
    const creature = cloneStatBlock(baseCreature);
    
    const targetLevel = baseCreature.system.details.level.value + levelVariance;
    
    creature.system.details.level.value += levelVariance;
    
    creature.system.attributes.hp.value = getScaledHP(baseCreature, targetLevel);
    creature.system.attributes.ac.value = getScaledArmor(baseCreature, targetLevel); 
    creature.system.perception.mod = getScaledPerception(baseCreature, targetLevel);
    
    creature.system.saves.reflex.value = getScaledReflex(baseCreature, targetLevel);
    creature.system.saves.fortitude.value = getScaledFortitude(baseCreature, targetLevel);
    creature.system.saves.will.value = getScaledWill(baseCreature, targetLevel);

    levelModifyAllStrikes(creature, baseCreature, targetLevel);
    levelModifyAllSkills(creature, baseCreature, targetLevel);
    ModifyAbilitiesByLevel(creature, baseCreature, targetLevel);
    
    //TODO resistances
    
    return creature;
    
}

export function addLanguages(baseCreature : StatsJson, language: string, addOnlyIfSpeaks : boolean) : StatsJson
{
    if (addOnlyIfSpeaks && baseCreature.system.details.languages.value.length === 0)
        return baseCreature;

    const sb = cloneStatBlock(baseCreature);
    
    if (sb.system.details.languages.value.includes(language))
        return sb;
    
    sb.system.details.languages.value.push(language)    
    return sb;
}

export function addSpeed(baseCreature : StatsJson, value: TypedValue)
{
    if (baseCreature.system.attributes.speed.otherSpeeds === undefined)
        baseCreature.system.attributes.speed.otherSpeeds = [];
    
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

export function addResistances(sb: StatsJson, resistances: string[], value: number) {
    for (const trait of resistances) {
        addResistance(sb, {type:trait,  value:value});
    }
}

export function addResistance(baseCreature : StatsJson, value: TypedValue | Resistance)
{
    if (baseCreature.system.attributes.resistances === undefined)
        baseCreature.system.attributes.resistances = [];
    
    if ((baseCreature.system.attributes.resistances.filter(v => {return v.type === value.type})).length > 0){
        const resistance = baseCreature.system.attributes.resistances.filter(v => {return v.type === value.type})[0];
        resistance.value = Math.max(resistance.value, value.value);
        return;
    }

    baseCreature.system.attributes.resistances.push(value);
}

export function addWeaknesses(sb: StatsJson, weaknesses: string[], value: number){
    for (const weakness of weaknesses) {
        addWeakness(sb, {type:weakness, value:value});
    }
}

export function addWeakness(baseCreature : StatsJson, value: TypedValue)
{
    if (baseCreature.system.attributes.weaknesses === undefined)
        baseCreature.system.attributes.weaknesses = [];
    
    if ((baseCreature.system.attributes.weaknesses.filter(v => {return v.type === value.type})).length > 0){
        const weakness = baseCreature.system.attributes.weaknesses.filter(v => {return v.type === value.type})[0];
        weakness.value = Math.max(weakness.value, value.value);
        return;
    }
    
    baseCreature.system.attributes.weaknesses.push(value);
}

export function addImmunities(baseCreature : StatsJson, value: string[]){
    for (const trait of value) {
        addImmunity(baseCreature, trait);
    }
}

export function addImmunity(baseCreature : StatsJson, value: string)
{
    if (baseCreature.system.attributes.immunities === undefined)
        baseCreature.system.attributes.immunities = [];
    baseCreature.system.attributes.immunities.push({exceptions:[], type:value});
}

export function changeSize(baseCreature : StatsJson, value: ("tiny"|"small"|"medium"|"large"|"huge"|"gargantuan")) : StatsJson
{
    if (baseCreature.system.traits.value.includes("troop"))
        return baseCreature;
    
    const sb = cloneStatBlock(baseCreature);
    sb.system.traits.size.value = value;
    return sb;
}

export function modifyAbilitiesDcs(creature : StatsJson, value : number)
{
    const abilities = GetGenericAbilities(creature);

    for (const ability of abilities)
    {
        let desc = ability.system.description.value;

        desc = desc.replace(checkRegex, (_match, _save, dc) => {
            if (dc === undefined) return _match;
            return _match.replace(dc, (parseInt(dc) + value).toString());
        });

        desc = desc.replace(actionTooltipRegex, (_match, _text, dc) => {
            if (dc === undefined) return _match;
            return _match.replace(dc, (parseInt(dc) + value).toString());
        });

        ability.system.description.value = desc;
    }
}

export function modifyAbilitiesDamage(creature : StatsJson, valueToIncrease : number)
{
    const abilities = GetGenericAbilities(creature);

    for (const ability of abilities) 
    {
        let desc = ability.system.description.value;
        desc = desc.replace(damageRegex, (_match, damageInfoMatch) => 
            {
                const split = damageInfoMatch.toString().split(/(?<=\]),/);
                //let roll: { dice: string, dmgType1: string, dmgType2: string };

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
                                const newDice = dice.replace(diceRegex, (_m:  string) =>{
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

export const CreatureAdjustmentList = [Elite, Weak, 
    Catfolk, Dwarf, Elf, Gnome, Goblin, Halfling, Leshy, Minotaur, Merfolk, Orc,
    Zombie, Skeleton, Ghost, Ghoul, Mummy, Shadow, Vampire, Wight,
    Air, Earth, Fire, Metal, Wood, Water];

