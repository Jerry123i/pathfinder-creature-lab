import type {StatBlockProp} from "./StatBlock.tsx";
import {modifyAllSaves} from "./StatBlock.tsx";
import {cloneStatBlock} from "./StatBlock.tsx";
import {modifyAllStrikes} from "./Strikes.tsx";
import {modifyAllSkills} from "./Skills.tsx";
import {ModifyAbilitiesAndRelatedStats} from "./Abilities.tsx";

export interface CreatureAdjustment {
    _id: string;
    description: string;
    name: string;
    priority: number;

    apply: (statblock: StatBlockProp) => StatBlockProp;
}

export const Elite : CreatureAdjustment = {
    _id: "adj_elite",
    name: "Elite",
    description: "Sometimes you’ll want a creature that’s just a bit more powerful than normal so that you can present a challenge that would otherwise be trivial or show that one enemy is stronger than its kin.", 
    priority: -9,
    apply: (statblock: StatBlockProp) =>
    {
        console.log("Elite");
        const sb = cloneStatBlock(statblock);
        const initLevel = statblock.system.details.level.value;
        sb.system.details.level.value += (initLevel < 1) ? 2 : 1;
        sb.system.attributes.ac.value += 2;
        modifyAllSaves(sb.system, 2);
        sb.system.perception.mod += 2;
        modifyAllSkills(sb.system, 2);
        //add attacks
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
        
        return sb;
    }
}

export const Weak : CreatureAdjustment = {
    _id: "adj_weak",
    name: "Weak",
    description: "Sometimes you’ll want a creature that’s weaker than normal so you can use a creature that would otherwise be too challenging or show that one enemy is weaker than its kin.",
    priority: -9,
    apply: (statblock: StatBlockProp) =>
    {
        const sb = cloneStatBlock(statblock);
        const initLevel = statblock.system.details.level.value;
        sb.system.details.level.value -= (initLevel === 1) ? 2 : 1;
        sb.system.attributes.ac.value -= 2;
        modifyAllSaves(sb.system, -2);
        sb.system.perception.mod -= 2;
        modifyAllSkills(sb.system, -2);
        //add attacks
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

        console.log("val " + hpDecreaseValue);
        
        sb.system.attributes.hp.value -= hpDecreaseValue;
        modifyAllStrikes(sb, -2, -2);

        return sb;
    }
}

export const Goblin : CreatureAdjustment = {
    _id: "adj_goblin",
    name: "Goblin",
    description: "Goblins are a short, scrappy, energetic people who have spent millennia maligned and feared.",
    priority: 1,
    apply: (statblock: StatBlockProp) =>
    {
        console.log("Goblin");
        const sb = cloneStatBlock(statblock);
        
        ModifyAbilitiesAndRelatedStats(sb,  "dex", 1);
        ModifyAbilitiesAndRelatedStats(sb,  "cha", 1);
        ModifyAbilitiesAndRelatedStats(sb,  "wis", -1);
        
        return sb;
    }
}

export const Minotaur : CreatureAdjustment = {
    _id: "adj_minotaur",
    name: "Minotaur",
    description: "Minotaurs are horned, bovine humanoids who originate from an ancient divine curse. Minotaurs are large, strong, and masters of crafts and puzzles, inclinations that lead many minotaurs to explore architecture and stonework. Minotaurs are most at home in labyrinths, whether natural, artificial, or psychological.",
    priority: 1,
    apply: (statblock: StatBlockProp) =>
    {
        const sb = cloneStatBlock(statblock);

        ModifyAbilitiesAndRelatedStats(sb,  "str", 1);
        ModifyAbilitiesAndRelatedStats(sb,  "con", 1);
        ModifyAbilitiesAndRelatedStats(sb,  "cha", -1);

        return sb;
    }
}

export const Merfolk : CreatureAdjustment = {
    _id: "adj_merfolk",
    name: "Merfolk",
    description: "Merfolk are a half-human, half-fish aquatic people who live in every ocean and sea of Golarion. Merfolk use magic as other peoples might use common tools, especially to control water, create omens, and in their beguiling songs.",
    priority: 1,
    apply: (statblock: StatBlockProp) =>
    {
        const sb = cloneStatBlock(statblock);

        ModifyAbilitiesAndRelatedStats(sb,  "dex", 1);
        ModifyAbilitiesAndRelatedStats(sb,  "cha", 1);
        ModifyAbilitiesAndRelatedStats(sb,  "con", -1);

        return sb;
    }
}

export function applyAllAdjustments(baseCreature : StatBlockProp, adjustments : CreatureAdjustment[]) : StatBlockProp
{
    if (adjustments.length === 0)
        return  baseCreature;
    
    let creature = cloneStatBlock(baseCreature);

    adjustments.sort((a,b)=> a.priority-b.priority);
    
    for (let i = 0; i < adjustments.length; i++) {
        creature = adjustments[i].apply(creature);
    }
    
    return creature;
    
}
export const CreatureAdjustmentList = [Elite, Weak, Goblin, Minotaur, Merfolk];