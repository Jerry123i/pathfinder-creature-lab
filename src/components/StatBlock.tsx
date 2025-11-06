import {Fragment} from "react";


export interface StatBlockProp{
    _id : string;
    name : string;
    system : GameSystems;
}

export interface GameSystems{
    abilities : Abilities;
    details : Details;
    attributes : Attributes;
    perception : Mod;
    skills : SkillList;
    saves : {fortitude : ValueHolder, reflex : ValueHolder, will : ValueHolder};
}

export function modifyAllSaves(creature : GameSystems, value : number){
    creature.saves.reflex.value += value;
    creature.saves.fortitude.value += value;
    creature.saves.will.value += value;
}

export interface Attributes{
    ac : ValueHolder;
    allSaves : string;
    hp : ValueHolder;
    speed : ValueHolder;
}

export interface Mod{
    mod :number;
}

export interface ValueHolder{
    type?: string;
    saveDetail?: number;
    value :number;
}

export interface Abilities{
    cha : Mod;
    con : Mod;
    dex : Mod;
    int : Mod;
    str : Mod;
    wis : Mod;
}

export interface SkillList{
    acrobatics?: Skill;
    arcana?: Skill;
    athletics?: Skill;
    crafting?: Skill;
    deception?: Skill;
    diplomacy?: Skill;
    intimidation? : Skill;
    medicine? : Skill;
    nature? : Skill;
    occultism? : Skill;
    performance? : Skill;
    religion? : Skill;
    society? : Skill;
    stealth? : Skill;
    survival? : Skill;
    thievery? : Skill;
}

type SkillName = keyof SkillList;

export function modifyAllSkills(creature: GameSystems, value: number) {
    const { skills } = creature;
    if (!skills) return;

    for (const key of Object.keys(skills) as SkillName[]) {
        const skill = skills[key];
        if (skill) skill.base += value;
    }
}

//TODO implement this
export function modifySkill(creature : GameSystems, name : SkillName, value : number)
{
    if (creature === undefined)
        return;
    
    let skill = creature.skills[name];
    
    if (skill === undefined){
        skill = new class implements Skill {
            base = value;
        }
        return
    }
    
    skill.base = value;
}

export interface Skill{
    base: number;
}

export interface Details{
    level : ValueHolder;
    publicNotes: string;
}


function statBlock(value : StatBlockProp) {

    return (<>
        <h1 style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <span>{value.name}</span>
            <span>{value.system.details.level.value}</span>
        </h1>
        <p dangerouslySetInnerHTML={{__html: value.system.details.publicNotes}}></p>
        <hr/>
        {printMod(value.system.perception, "Perception")}<br/>
        <b>Skills</b> {printSkills(value.system.skills)}<br/>
        <hr/>
        {printValue(value.system.attributes.ac, "AC")}{";"}
        {printValueWithSignal(value.system.saves.fortitude, "Fort")}{";"}
        {printValueWithSignal(value.system.saves.reflex, "Ref")}{";"}
        {printValueWithSignal(value.system.saves.will, "Will")}
        
        <br/>
        {printValue(value.system.attributes.hp, "HP")}
        <p>
            {printMod(value.system.abilities.str, "STR")}{";"}
            {printMod(value.system.abilities.dex, "DEX")}{";"}
            {printMod(value.system.abilities.con, "CON")}{";"}
            {printMod(value.system.abilities.int, "INT")}{";"}
            {printMod(value.system.abilities.wis, "WIS")}{";"}
            {printMod(value.system.abilities.cha, "CHA")}
        </p>
    </>)
}

export function cloneStatBlock(statBlock: StatBlockProp): StatBlockProp {
    return {
        _id: crypto.randomUUID(), // give it a new unique ID
        name: statBlock.name,
        system: {
            abilities: {
                str: { mod: statBlock.system.abilities.str.mod },
                dex: { mod: statBlock.system.abilities.dex.mod },
                con: { mod: statBlock.system.abilities.con.mod },
                int: { mod: statBlock.system.abilities.int.mod },
                wis: { mod: statBlock.system.abilities.wis.mod },
                cha: { mod: statBlock.system.abilities.cha.mod },
            },
            details: {
                level: { ...statBlock.system.details.level },
                publicNotes: statBlock.system.details.publicNotes,
            },
            attributes: {
                ac: { ...statBlock.system.attributes.ac },
                allSaves: statBlock.system.attributes.allSaves,
                hp: { ...statBlock.system.attributes.hp },
                speed: { ...statBlock.system.attributes.speed },
            },
            perception: { ...statBlock.system.perception },
            skills: Object.fromEntries(
                Object.entries(statBlock.system.skills).map(([k, v]) => [k, v ? { base: v.base } : v])
            ) as SkillList,
            saves: {
                fortitude: { ...statBlock.system.saves.fortitude },
                reflex: { ...statBlock.system.saves.reflex },
                will: { ...statBlock.system.saves.will },
            },
        },
    };
}


function printMod(mod: Mod, name: string)
{
    const val = mod.mod;

    if (val === 0) return <> <b>{name}</b> 0</>;
    if (val < 0) return <> <b>{name}</b> {val}</>;
    return <> <b>{name}</b> +{val}</>;
}

function printSkills(list: SkillList) {
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

function printValue(value: ValueHolder, name: string)
{
    const val = value.value;
    return <> <b>{name}</b> {val}</>;
}

function printValueWithSignal(value: ValueHolder, name: string) {
    const val = value.value;
    return <> <b>{name}</b> {val < 0 ? "-":"+"}{val}</>;
}

// function SkillsList(value : Skill[] )
// {
//     if (value == null)
//         return <p>No skills</p>
//    
//     return(<>
//         <hr />
//         <ul className="list-group">
//             {value.map((skill)=>(
//                 <>
//                     <h3>{skill.name}</h3>
//                     <p>{skill.description}<br />{skill.damage}</p>
//                 </>
//             ))}
//         </ul>
//         </>
//     )
// }

export default statBlock;



