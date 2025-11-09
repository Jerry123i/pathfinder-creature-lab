import {Fragment} from "react";
import type {CreatureSystems} from "./StatBlock.tsx";
import type {AbilityName} from "./Abilities.tsx";

export interface Skill {
    base: number;
}


export interface SkillList {
    acrobatics?: Skill;
    arcana?: Skill;
    athletics?: Skill;
    crafting?: Skill;
    deception?: Skill;
    diplomacy?: Skill;
    intimidation?: Skill;
    medicine?: Skill;
    nature?: Skill;
    occultism?: Skill;
    performance?: Skill;
    religion?: Skill;
    society?: Skill;
    stealth?: Skill;
    survival?: Skill;
    thievery?: Skill;
}

type SkillName = keyof SkillList;

export function modifyAllSkills(creature: CreatureSystems, value: number) {
    const {skills} = creature;
    if (!skills) return;

    for (const key of Object.keys(skills) as SkillName[]) {
        const skill = skills[key];
        if (skill) skill.base += value;
    }
}

export function ModifyAssociatedSkills(creatureSkills: SkillList,  ability : AbilityName, value: number)
{
    switch (ability){
        case "cha":
            TryModifySkill(creatureSkills, "deception", value)
            TryModifySkill(creatureSkills, "diplomacy", value)
            TryModifySkill(creatureSkills, "intimidation", value)
            TryModifySkill(creatureSkills, "performance", value)
            break;
        case "con":
            break;
        case "dex":
            TryModifySkill(creatureSkills, "acrobatics", value)
            TryModifySkill(creatureSkills, "stealth", value)
            TryModifySkill(creatureSkills, "thievery", value)
            break;
        case "int":
            TryModifySkill(creatureSkills, "arcana", value)
            TryModifySkill(creatureSkills, "crafting", value)
            TryModifySkill(creatureSkills, "occultism", value)
            TryModifySkill(creatureSkills, "society", value)
            break;
        case "str":
            TryModifySkill(creatureSkills, "athletics", value)
            break;
        case "wis":
            TryModifySkill(creatureSkills, "medicine", value)
            TryModifySkill(creatureSkills, "religion", value)
            TryModifySkill(creatureSkills, "nature", value)
            TryModifySkill(creatureSkills, "survival", value)
            break;
    }    
}

export function TryModifySkill(skills: SkillList, name: SkillName, value: number) {
    if (skills === undefined)
        return;
    
    
    const skill = skills?.[name];
    if (!skill) return;

    skill.base += value;
}

export function printSkills(list: SkillList) {
    const keys = Object.keys(list) as (keyof SkillList)[];
    const definedSkills = keys.filter(k => list[k]);

    if (definedSkills.length === 0) return <p>No skills</p>;

    return (
        <>
            {definedSkills.map((skillInterfaceKey) => {
                const skill = list[skillInterfaceKey]!;
                let skillName = skillInterfaceKey;
                skillName = skillName[0].toUpperCase() + skillName.slice(1);
                return (
                    <Fragment key={skillInterfaceKey}>{skillName} {skill.base >= 0 ? "+" : ""}{skill.base}; </Fragment>
                );
            })}
        </>
    );
}