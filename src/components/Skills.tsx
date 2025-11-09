import {Fragment} from "react";
import type {CreatureSystems} from "./StatBlock.tsx";

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

//TODO implement this
export function modifySkill(creature: CreatureSystems, name: SkillName, value: number) {
    if (creature === undefined)
        return;

    let skill = creature.skills[name];

    if (skill === undefined) {
        skill = new class implements Skill {
            base = value;
        }
        return
    }

    skill.base = value;
}

export interface Skill {
    base: number;
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