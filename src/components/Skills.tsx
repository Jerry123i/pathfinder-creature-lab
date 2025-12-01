import {Fragment} from "react";
import {type CreatureSystems, GetLoreItems, GetValue, NullableValueChange, type StatBlockProp} from "./StatBlock.tsx";
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

    for (let i = 0; i < lores.length; i++)
    {
        NullableValueChange(lores[i].system.mod, value);
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

export function TryModifySkill(skills: SkillList, name: SkillName, value: number) 
{
    if (skills === undefined)
        return;
    
    const skill = skills?.[name];
    if (!skill) return;

    skill.base += value;
}

export function TryModifyLore(creature: StatBlockProp, value: number) {

    const lores  = GetLoreItems(creature);

    for (let i = 0; i < lores.length; i++) {
        NullableValueChange(lores[i].system.mod, value);
    }
    
}

export function AddSkill(creature: StatBlockProp, name:SkillName, value: number) 
{
    if (creature.system.skills === undefined)
        creature.system.skills = {};

    const skill = creature.system.skills?.[name];
    if (!skill)
        creature.system.skills[name] = {base: value};
    else if (skill.base < value)
        skill.base = value;

}

function GetSpecialSkills(skill: Skill) {
    
    let stringValue = "";

    if (skill.special === undefined)
        return (<></>);
    
    for (let i = 0; i < skill.special?.length; i++)
    {
        const special = skill.special[i];
        stringValue += (i>0? ", ":"") + (special.base >= 0 ? "+" : "") +special.base + " " + special.label;
    }
    
    if (stringValue === "")
        return (<></>);
    
    return (<>({stringValue})</>);
}

export function getHighestSkill(creature:StatBlockProp) : {name: SkillName, value: number}
{
    let higherValue = 0;
    let higherSkill : SkillName = null ;
    
    for (const key of Object.keys(creature.system.skills) as SkillName[])
    {
        const skill = creature.system.skills[key];
        
        if (skill === undefined)
            continue;
        
        if (skill.base > higherValue)
        {
            higherValue = skill.base;
            higherSkill = key as SkillName;
        }
    }
    
    return {name:higherSkill, value:higherValue};
    
}

export function printSkills(creature:StatBlockProp,list: SkillList) {
    
    if (list === undefined)
        return <></>;
    
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
                    <Fragment key={skillInterfaceKey}>{skillName} {skill.base >= 0 ? "+" : ""}{skill.base}{skill.special !== undefined && GetSpecialSkills(skill)}; </Fragment>
                );
            })}
            {lores.length > 0 && lores.map((loreInterfaceKey) => {
                return <Fragment key={loreInterfaceKey.name}>{loreInterfaceKey.name} {GetValue(loreInterfaceKey.system.mod) >= 0 ? "+" : ""}{loreInterfaceKey.system.mod.value}; </Fragment>
            })}
        </>
    );
}