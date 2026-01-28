import type {Mod, StatsJson} from "./StatBlock.tsx";
import {ModifyAssociatedSkills} from "./Skills.tsx";

import {ModifyStrikesByAbility} from "./Strikes.tsx";
import {getScaledAttribute} from "../assets/GMTables.tsx";

export interface Abilities {
    cha: Mod;
    con: Mod;
    dex: Mod;
    int: Mod;
    str: Mod;
    wis: Mod;
}

export type AbilityName = keyof Abilities;

export function ModifyAbilitiesAndRelatedStats(creature : StatsJson , ability : AbilityName, value : number)
{
    const allAbilities = creature.system.abilities;
    
    switch (ability){
        case "cha":
            allAbilities.cha.mod += value;
            break;
        case "con":
            creature.system.saves.fortitude.value += value;
            allAbilities.con.mod += value;
            break;
        case "dex":
            creature.system.saves.reflex.value += value;
            allAbilities.dex.mod += value;
            break;
        case "int":
            allAbilities.int.mod += value;
            break;
        case "str":
            allAbilities.str.mod += value;
            break;
        case "wis":
            creature.system.saves.will.value += value;
            allAbilities.wis.mod += value;
            break;

    }
    
    if (ability === "wis")
        creature.system.perception.mod += value;

    ModifyAssociatedSkills(creature, ability, value);
    ModifyStrikesByAbility(creature,  ability, value);
}

export function ModifyAbilitiesByLevel(creature : StatsJson, baseCreature: StatsJson, targetLevel : number)
{
    const ab = creature.system.abilities;
    const keys = Object.keys(ab);
    
    for (const key of keys)
    {
        ab[key as AbilityName].mod = getScaledAttribute(baseCreature, key.toString() as AbilityName,  targetLevel)    
    }
}
