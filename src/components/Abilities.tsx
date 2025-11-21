import type {Mod, StatBlockProp} from "./StatBlock.tsx";
import {ModifyAssociatedSkills} from "./Skills.tsx";

import {ModifyStrikesByAbility} from "./Strikes.tsx";

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
    const allAbilities = creature.system.abilities;
    
    switch (ability){
        case "cha":
            allAbilities.cha.mod += value;
            break;
        case "con":
            allAbilities.con.mod += value;
            break;
        case "dex":
            allAbilities.dex.mod += value;
            break;
        case "int":
            allAbilities.int.mod += value;
            break;
        case "str":
            allAbilities.str.mod += value;
            break;
        case "wis":
            allAbilities.wis.mod += value;
            break;

    }
    
    if (ability === "wis")
        creature.system.perception.mod += value;

    ModifyAssociatedSkills(creature, ability, value);
    ModifyStrikesByAbility(creature,  ability, value);
}