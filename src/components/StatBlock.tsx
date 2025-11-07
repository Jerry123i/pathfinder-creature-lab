import {Fragment} from "react";


export interface StatBlockProp{
    _id : string;
    name : string;
    system : CreatureSystems;
    items : CreatureItem[];
}

export interface CreatureSystems {
    abilities : Abilities;
    details : Details;
    attributes : Attributes;
    perception : Mod;
    skills : SkillList;
    saves : {fortitude : ValueHolder, reflex : ValueHolder, will : ValueHolder};
}

export function modifyAllSaves(creature : CreatureSystems, value : number){
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

export interface CreatureItem {
    _id: string
    img: string
    name: string
    sort: number
    system: ItemSystem
    type: string
    _stats?: Stats
}
export interface CreatureItemStrike extends CreatureItem{
    system: StrikeSystem
}

function GetStrikes(value : StatBlockProp): CreatureItemStrike[]{
    
    return value.items.filter(item => item.type === "melee") as CreatureItemStrike[]; 
}

function GetSpells(value : StatBlockProp): CreatureItem[]{
    return value.items.filter(item => item.type === "spell");
}

export interface ItemSystem {
    description: StringHolder,
}

export interface StrikeSystem extends ItemSystem {
    bonus : ValueHolder,
    weaponType? : StringHolder,
    range: {increment : number, max: number},
    traits : {rarity?: string, value : string[]}
    damageRolls : Record<string, DamageRollInfo>
}

function GetDamagesInfo(value : StrikeSystem): DamageRollInfo
{
    const roll = value.damageRolls!;
    const keys = Object.keys(roll);
    
    for(const key of keys){
        const damageRoll = roll[key] as DamageRollInfo;
        return damageRoll;
    }
    
    return {damage:0, damageType:"null"};
}

export interface Stats{
    compendiumSource : string;
}

export interface Mod{
    mod :number;
}

export interface ValueHolder{
    type?: string;
    saveDetail?: number;
    value :number;
}

export interface StringHolder{
    value : string;
}

export interface DamageRollInfo{
    damage: number;
    damageType: string;
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

export function modifyAllSkills(creature: CreatureSystems, value: number) {
    const { skills } = creature;
    if (!skills) return;

    for (const key of Object.keys(skills) as SkillName[]) {
        const skill = skills[key];
        if (skill) skill.base += value;
    }
}

//TODO implement this
export function modifySkill(creature : CreatureSystems, name : SkillName, value : number)
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
        <hr />
        <h2>Strikes</h2>
        <ul>
            {GetStrikes(value).map(i => <li>{PrintStrike(i)}</li>)}
        </ul>
        <h2>Spells</h2>
        <ul>
            {GetSpells(value).map(item => <li>{item.name} - {item.type}</li>)}
        </ul>
    </>)
}

function PrintStrike(item : CreatureItemStrike)
{
    if (item.system.weaponType === undefined){
        item.system.weaponType = {value:"melee"};
        
        if (item.system.range !== undefined){
            if (item.system.range?.increment > 0)
                item.system.weaponType = {value:"ranged"};
        }
        
    }
    
    let map : number;
    map = 5;
    
    if (item.system.traits.value.includes("agile"))
        map = 4;
    
    return (<>
        <b>{item.system.weaponType.value}</b> {item.name} {printNumberWithSignal(item.system.bonus.value)} [{printNumberWithSignal(item.system.bonus.value-map)}/{printNumberWithSignal(item.system.bonus.value- (map*2))}]
        {GetDamagesInfo(item.system).damage} {GetDamagesInfo(item.system).damageType}
    </>)
}

export function cloneStatBlock(statBlock: StatBlockProp): StatBlockProp {
    return {
        items: statBlock.items,
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
        }
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
    return <> <b>{name}</b> {val < 0 ? "":"+"}{val}</>;
}

function printNumberWithSignal(value: number) {
    const val = value;
    return <>{val < 0 ? "":"+"}{val}</>;
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



