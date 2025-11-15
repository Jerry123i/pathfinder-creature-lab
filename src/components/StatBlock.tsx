import {type CreatureItemStrike, GetStrikes, PrintStrike} from "./Strikes.tsx";
import {printSkills, type SkillList} from "./Skills.tsx";
import type {Abilities} from "./Abilities.tsx";
import {type CreatureItemSpell, GetSpells, HasSpells, PrintSpells} from "./Spells.tsx";
import {capitalize} from "./TypeScriptHelpFunctions.tsx";
import {Fragment} from "react";

export interface StatBlockProp {
    _id: string;
    name: string;
    system: CreatureSystems;
    items: CreatureItem[];
    spellsAnnotation: string;
}

export interface CreatureSystems {
    abilities: Abilities;
    details: Details;
    attributes: Attributes;
    perception: Mod;
    skills: SkillList;
    saves: { fortitude: ValueHolder, reflex: ValueHolder, will: ValueHolder };
    traits: Traits;
}

export interface Traits {
    rarity: string;
    size: { value: string };
    value: string[];
}

export function modifyAllSaves(creature: CreatureSystems, value: number) {
    creature.saves.reflex.value += value;
    creature.saves.fortitude.value += value;
    creature.saves.will.value += value;
}

export function AddTrait(creature: StatBlockProp, value: string) {
    if (creature.system.traits.value.includes(value))
        return;

    creature.system.traits.value.push(value)
}

export function RemoveTrait(creature: StatBlockProp, value: string) {
    if (!creature.system.traits.value.includes(value))
        return;

    creature.system.traits.value = creature.system.traits.value.filter(x => x != value); 
}

export interface Attributes {
    ac: ValueHolder;
    allSaves: string;
    hp: ValueHolder;
    speed: SpeedValue;
    resistances: TypedValue[];
    immunities : {type: string}[];
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

export interface CreatureItemLore extends CreatureItem{
    system : LoreItemSystem;
}

export function GetGenericAbilities(value: StatBlockProp): CreatureItem[] {
    const spells = GetSpells(value);
    const strikes = GetStrikes(value);

    const allItems = value.items;

    return allItems.filter(item => {
        return (
            !spells.includes(item as CreatureItemSpell)
            && !strikes.includes(item as CreatureItemStrike)
            && item.type != "weapon"
            && item.type != "armor"
            && item.type != "spellcastingEntry"
            && item.type != "lore"
            && item.type != "equipment"
            && item.system.slug != "telepathy"
            && item.system.slug != "constant-spells"
        )
    })
}

export function GetLoreItems(value : StatBlockProp) {
    return value.items.filter(item => item.type === "lore") as CreatureItemLore[];
}

export function GetAbilityNameFromSlug(creature: StatBlockProp,slug: string): string
{
    const match = creature.items.filter(item => {return item.system.slug === slug});
    
    if (match.length === 0)
        return slug;
    
    return match[0].name;
}

export interface ItemSystem {
    description: StringHolder,
    traits: Traits,
    slug: string,
    actions: ValueHolder | null,
    actionType : StringHolder
}

export interface LoreItemSystem extends ItemSystem {
    mod: ValueHolder;
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
    value: number | null;
}

export interface TypedValue {
    type: string;
    value: string;
}

export interface SpeedValue {
    value: number;
    otherSpeeds: TypedValue[];
}

export interface StringHolder {
    value: string;
}

export interface DamageRollInfo {
    damage: string;
    damageType: string;
}

export interface DiceAndModifier {
    diceType: number;
    diceNumber: number;
    modifier: number;
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

export function DiceString(value: DiceAndModifier): string {
    return (value.diceNumber.toString() + "d" + value.diceType.toString() + (value.modifier === 0 ? "" : printNumberWithSignalString(value.modifier)))
}

export interface Details {
    level: ValueHolder;
    publicNotes: string;
    languages: {details : string, value : string[]}
}


function GetActionIcon(value: CreatureItem) 
{
    if (value.system.actionType === undefined)
        return null;
    if (value.system.actionType.value === undefined)
        return null;
    
    if (value.system.actionType.value === "reaction")
        return (<>R </>);
    if (value.system.actionType.value === "passive")
        return null;
    
    if (value.system.actions === undefined)
        return null;
    if (value.system.actions?.value === undefined)
        return null;
    
    if (value.system.actions.value === 0)
        return null;
    
    return (<>{value.system.actions.value}A </>)
    
}

function statBlock(value: StatBlockProp) {

    return (<>
        <h1 style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <span>{value.name}</span>
            <span>{value.system.details.level.value}</span>
        </h1>
        {printTraitsTransformElement(value.system.traits, (s, i) => {
            return (<p className="inline-block bg-[#531004] text-white border-double border-2 border-[#d5c489] font-semibold text-[1.0em] not-italic px-[5px] text-left indent-0 my-[0.1em]">{s.toString()}</p>)
        })}
        <p dangerouslySetInnerHTML={{__html: value.system.details.publicNotes}}></p>
        {value.system.details.languages.value.length > 0 && (<><b>Languages: </b> {value.system.details.languages.value.map((l, index) =>
        {
            return ((index===0?"":", ") + capitalize(l))
        }
        )}</>)}{value.system.details.languages?.details && (<>, ({value.system.details.languages?.details})</>)}
        <hr/>
        {printMod(value.system.perception, "Perception")}<br/>
        <b>Skills</b> {printSkills(value,  value.system.skills)}<br/>
        <hr/>
        {printValue(value.system.attributes.ac, "AC")}{";"}
        {printValueWithSignal(value.system.saves.fortitude, "Fort")}{";"}
        {printValueWithSignal(value.system.saves.reflex, "Ref")}{";"}
        {printValueWithSignal(value.system.saves.will, "Will")}

        <br/>
        {printValue(value.system.attributes.hp, "HP")}
        {value.system.attributes.resistances === undefined ? null : (
            <>
                <b> Resistances:</b>{" "}
                {value.system.attributes.resistances.map(res => (
                    <>{capitalize(res.type)} {res.value} </>
                ))}
            </>
        )}
        {value.system.attributes.immunities === undefined ? null : (
            <>
                <b> Immunities:</b>{" "}
                {value.system.attributes.immunities.map((imu, index) => (
                    <>{index===0?null:", "}{capitalize(imu.type)}</>
                ))}
            </>
        )}
        <br/>
        {printValue(value.system.attributes.speed, "Speed")}ft
        {value.system.attributes.speed.otherSpeeds.length > 0 ?
            value.system.attributes.speed.otherSpeeds.map(value => {
                return (<>; <b>{capitalize(value.type)}</b> {value.value}ft</>)
            })
            : null}
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
            {GetStrikes(value).map(i => <li>{PrintStrike(value,i)}</li>)}
        </ul>
        <ul>
            {GetGenericAbilities(value).map(abilityItem => (<li>
                <h3>{GetActionIcon(abilityItem)}{abilityItem.name}</h3>
                {abilityItem.system.traits.value?.length > 0 ?
                    <p>({printTraitsSeparator(abilityItem.system.traits, " ,")})</p> : null}
                <p dangerouslySetInnerHTML={{__html: parseAbilityDescription(abilityItem.system.description.value)}}></p>
            </li>))}
        </ul>
        {HasSpells(value) ? (<>
            <h2>Spells</h2>
            {PrintSpells(value)}
        </>) : <></>}
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

export function printTraitsTransform (value: Traits, stringTransform: (s: string, i: number) => string) {
    const parts: string[] = [];

    if (value?.rarity && value.rarity.toLowerCase() !== "common") {
        parts.push(capitalize(value.rarity));
    }

    if (value?.size?.value) {
        parts.push(capitalize(value.size.value));
    }

    const traits = value?.value ?? [];
    const startIndex = parts.length;
    const transformedParts = [
        ...parts.map((part, i) => stringTransform(part, i)),
        ...traits.map((trait, index) => stringTransform(capitalize(trait), startIndex + index)),
    ];

    return <>{transformedParts}</>;
}

export function printTraitsTransformElement (value: Traits, stringTransform: (s: string, i: number) => Element) {
    const parts: string[] = [];

    if (value?.rarity && value.rarity.toLowerCase() !== "common") {
        parts.push(capitalize(value.rarity));
    }

    if (value?.size?.value) {
        parts.push(capitalize(value.size.value));
    }

    const traits = value?.value ?? [];
    const startIndex = parts.length;
    const transformedParts = [
        ...parts.map((part, i) => stringTransform(part, i)),
        ...traits.map((trait, index) => stringTransform(capitalize(trait), startIndex + index)),
    ];

    return <>{transformedParts}</>;
}

export function printTraitsSeparator (value: Traits, separator: string) {
    
    return printTraitsTransform(value,  (s,i)=>{
        return i===0? s : (separator) + s;
    })
}

export function parseAbilityDescription(input: string): string {
    let output = input;


    output = output.replace(
        /@UUID\[[^\]]*\.Item\.[^\]]*]\{([^}]*)\}/g,
        (_match, label) => `<b>${label}</b>`
    );

    output = output.replace(
        /@UUID\[[^\]]*\.Item\.([^\]]*)\]/g,
        (_match, name) => `<b>${name}</b>`
    );

    output = output.replace(
        /@Damage\[\(?(\d+d\d+(?:\+\d+)?)\)?\[(\w+)(?:,(\w+))?\](?:\|\w+\:[\w+\-]+)?\]/g,
        (_match, dice, type, type2) => `<b>${dice}${type ? " " + type : ""}${type2 ? " " + type2 : ""}</b>`
    );

    output = output.replace(
        /@Check\[(fortitude|reflex|will)\|dc:(\d+)[^\]]*\]/gi,
        (_match, save, dc) => `<b>DC ${dc} ${capitalize(save)}</b>`
    );

    output = output.replace(
        /@Template\[(emanation|cone|burst|aura|line)\|distance:(\d+)\]/gi,
        (_match, shape, distance) => `<b>${distance}ft ${shape}</b>`
    );

    output = output.replace(
        /\[\[\/gmr [^\]]*]]\{([^}]*)\}/g,
        (_match, content) => `<b>${content}</b>`
    );

    output = output.replace(
        /@Localize\[PF2E\.NPC\.Abilities\.Glossary\..+]/g,
        (_match) => ""
    );

    return output;
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
    return ((val < 0 ? "" : "+") + (val));
}

export default statBlock;



