import {Fragment} from "react";
import {type CreatureSystems, GetLoreItems, type StatBlockProp} from "./StatBlock.tsx";
import type {AbilityName} from "./Abilities.tsx";

export interface Skill {
    base: number;
    label?: string;
    special?: Skill[];
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

export function modifyAllSkills(creatureStats : StatBlockProp ,creatureSystems: CreatureSystems, value: number) {
    const {skills} = creatureSystems;
    if (!skills) return;

    for (const key of Object.keys(skills) as SkillName[]) {
        const skill = skills[key];
        if (skill) skill.base += value;
    }
    
    const lores = GetLoreItems(creatureStats);

    for (let i = 0; i < lores.length; i++) {
        lores[i].system.mod.value += value;
    }
    
}

export function ModifyAssociatedSkills(creature : StatBlockProp,  ability : AbilityName, value: number)
{
    const creatureSkills = creature.system.skills;
    
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
            TryModifyLore(creature, value)
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

export function TryModifyLore(creature: StatBlockProp, value: number) {

    const lores  = GetLoreItems(creature);

    for (let i = 0; i < lores.length; i++) {
        lores[i].system.mod.value += value;
    }
    
}

function GetSpecialSkills(skill: Skill) {
    
    let stringValue = "";

    for (let i = 0; i < skill.special?.length; i++)
    {
        const special = skill.special[i];
        stringValue += (i>0? ", ":"") + (special.base >= 0 ? "+" : "") +special.base + " " + special.label;
    }
    
    return (<>({stringValue})</>);
}

export function printSkills(creature:StatBlockProp,list: SkillList) {
    const keys = Object.keys(list) as (keyof SkillList)[];
    const definedSkills = keys.filter(k => list[k]);

    const lores  = GetLoreItems(creature);
    
    if (definedSkills.length === 0 && lores.length === 0) return <p>No skills</p>;

    return (
        <>
            {definedSkills.map((skillInterfaceKey) => {
                const skill = list[skillInterfaceKey]!;
                let skillName = skillInterfaceKey;
                skillName = skillName[0].toUpperCase() + skillName.slice(1);
                return (
                    <Fragment key={skillInterfaceKey}>{skillName} {skill.base >= 0 ? "+" : ""}{skill.base}{skill.special !== undefined && GetSpecialSkills(skill)};</Fragment>
                );
            })}
            {lores.length > 0 && lores.map((loreInterfaceKey) => {
                return <Fragment key={loreInterfaceKey.name}>{loreInterfaceKey.name} {loreInterfaceKey.system.mod?.value >= 0 ? "+" : ""}{loreInterfaceKey.system.mod.value}</Fragment>
            })}
        </>
    );
}