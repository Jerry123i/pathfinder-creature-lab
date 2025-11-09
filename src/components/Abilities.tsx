import type {Mod, StatBlockProp} from "./StatBlock.tsx";
import {ModifyAssociatedSkills} from "./Skills.tsx";

export interface Abilities {
    cha: Mod;
    con: Mod;
    dex: Mod;
    int: Mod;
    str: Mod;
    wis: Mod;
}

export type AbilityName = keyof Abilities;

export function ModifyAbilitiesAndRelatedStats(creature : StatBlockProp ,ability : AbilityName, value : number)
{
    ModifyAssociatedSkills(creature.system.skills, ability, value);
    
    if (ability === "wis")
        creature.system.perception.mod += value;
}