import {GetStrikes, PrintStrike} from "./Strikes.tsx";
import {printSkills, type SkillList} from "./Skills.tsx";
import type {Abilities} from "./Abilities.tsx";
import {HasSpells, PrintSpells} from "./Spells.tsx";


export interface StatBlockProp {
    _id: string;
    name: string;
    system: CreatureSystems;
    items: CreatureItem[];
    spellsAnnotation : string;
}

export interface CreatureSystems {
    abilities: Abilities;
    details: Details;
    attributes: Attributes;
    perception: Mod;
    skills: SkillList;
    saves: { fortitude: ValueHolder, reflex: ValueHolder, will: ValueHolder };
    traits: {rarity: string, size: {value: string}, value: string[]};
}

export function modifyAllSaves(creature: CreatureSystems, value: number) {
    creature.saves.reflex.value += value;
    creature.saves.fortitude.value += value;
    creature.saves.will.value += value;
}

export function AddTrait(creature: StatBlockProp, value : string)
{
    if (creature.system.traits.value.includes(value))
        return;
    
    creature.system.traits.value.push(value)
}

export function RemoveTrait(creature : StatBlockProp, value : string){
    if (!creature.system.traits.value.includes(value))
        return;
    
    delete creature.system.traits.value[creature.system.traits.value.indexOf(value)];
}

export interface Attributes {
    ac: ValueHolder;
    allSaves: string;
    hp: ValueHolder;
    speed: ValueHolder;
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

export interface ItemSystem {
    description: StringHolder,
}

export interface Stats {
    compendiumSource: string;
}

export interface Mod {
    mod: number;
}

export interface ValueHolder {
    type?: string;
    saveDetail?: number;
    value: number;
}

export interface StringHolder {
    value: string;
}

export interface DamageRollInfo {
    damage: string;
    damageType: string;
}

export interface DiceAndModifier{
    diceType : number;
    diceNumber : number;
    modifier : number;
}

export function GetDice(value: DamageRollInfo): DiceAndModifier {
    const pattern = /(\d+)d(\d+)([+-]\d+)?/i; // matches e.g. 2d6, 3d10+5, 12d4-3
    const match = value.damage.toString().match(pattern);

    if (!match) {
        throw new Error(`Invalid dice format: ${value.damage}`);
    }

    const diceNumber = parseInt(match[1], 10);
    const diceType = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;

    return {
        diceType,
        diceNumber,
        modifier
    };
}

export function DiceString(value : DiceAndModifier): string{
    return (value.diceNumber.toString() + "d" + value.diceType.toString() + (value.modifier === 0 ? "" : printNumberWithSignalString(value.modifier)) )
}

export interface Details {
    level: ValueHolder;
    publicNotes: string;
}


function statBlock(value: StatBlockProp) {

    return (<>
        <h1 style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <span>{value.name}</span>
            <span>{value.system.details.level.value}</span>
        </h1>
        {printTraits(value)}
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
        <hr/>
        <h2>Strikes</h2>
        <ul>
            {GetStrikes(value).map(i => <li>{PrintStrike(i)}</li>)}
        </ul>
        {HasSpells(value)? (<>
            <h2>Spells</h2>
            {PrintSpells(value)}
        </>): <></>}
        
    </>)
}

export function cloneStatBlock(statBlock: StatBlockProp): StatBlockProp {
    return {
        _id: crypto.randomUUID(), // give the clone a new id
        name: statBlock.name,
        system: JSON.parse(JSON.stringify(statBlock.system)) as CreatureSystems,
        items: statBlock.items.map(item => ({
            ...JSON.parse(JSON.stringify(item))
        }))
    };
}

function printTraits(value : StatBlockProp) {
    return(
        <>
            [{value.system.traits.rarity}]
            [{value.system.traits.size?.value}]
            {value.system.traits.value.map( trait => <>[{trait}]</>)}
        </>
    )
}

function printMod(mod: Mod, name: string) {
    const val = mod.mod;

    if (val === 0) return <> <b>{name}</b> 0</>;
    if (val < 0) return <> <b>{name}</b> {val}</>;
    return <> <b>{name}</b> +{val}</>;
}

function printValue(value: ValueHolder, name: string) {
    const val = value.value;
    return <> <b>{name}</b> {val}</>;
}

function printValueWithSignal(value: ValueHolder, name: string) {
    const val = value.value;
    return <> <b>{name}</b> {val < 0 ? "" : "+"}{val}</>;
}

export function printNumberWithSignalElement(value: number) {
    const val = value;
    return <>{val < 0 ? "" : "+"}{val}</>;
}

export function printNumberWithSignalString(value: number) {
    const val = value;
    return ((val < 0 ? "" : "+")+(val));
}

export default statBlock;



