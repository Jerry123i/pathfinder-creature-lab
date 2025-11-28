import {
    type CreatureItemStrike,
    GetCombinedStrikes,
    GetStrikes,
    PrintReactiveStrikeLabel,
    PrintStrike
} from "./Strikes.tsx";
import {printSkills, type SkillList} from "./Skills.tsx";
import type {Abilities} from "./Abilities.tsx";
import {type CreatureItemSpell, GetSpells, HasSpells, PrintAllSpells} from "./Spells.tsx";
import {capitalize} from "./TypeScriptHelpFunctions.tsx";
import {GetTraitColor, printTraitsSeparator, printTraitsTransformElement, type Traits} from "./Traits.tsx";
import {PrintShield} from "./Shield.tsx";
import {
    GetFastHealing,
    GetRegeneration,
    isVoidHealing,
    PrintHP,
    PrintImmunity,
    PrintResistances,
    PrintWeakness
} from "./HPItems.tsx";
import {parseAbilityDescription} from "./Parsing.tsx";

export interface StatBlockProp {
    _id: string;
    name: string;
    system: CreatureSystems;
    items: CreatureItem[];
    //spellsAnnotation: string;
}

export interface CreatureSystems {
    abilities: Abilities;
    details: Details;
    attributes: Attributes;
    perception: Perception;
    skills: SkillList;
    saves: { fortitude: ValueHolder, reflex: ValueHolder, will: ValueHolder };
    traits: Traits;
}

export interface Perception{
    details : string;
    mod : number;
    senses : Sense[];
}

export interface Sense {
    type: string;
    range?: number;
    acuity?: SensePrecision;
}

export function AddDarkVision(sb: StatBlockProp, value : ("darkvision" | "low-light-vision"))
{
    const perception = sb.system.perception;
    
    const currentVision = GetDarknessVision(perception);
    if (currentVision?.type === value)
        return;
    
    if (currentVision?.type === "darkvision")
        return;
    
    if (currentVision === undefined)
        perception.senses.push({type:value})    
    else if (currentVision.type ===  "low-light-vision" && value === "darkvision")
        currentVision.type = value;
}

export function GetDarknessVision(value: Perception): Sense | undefined
{
    for (const sense of value.senses) {
        
        if (sense.type === "darkvision" || sense.type === "low-light-vision")
            return sense;
    }
    return undefined;
}

export function GetSpecialSenses(value: Perception): Sense[]
{
    const specialSenses: Sense[] = [];
    for (const sense of value.senses)
    {
        if (sense.type === "darkvision" || sense.type === "low-light-vision")
            continue;
        
        specialSenses.push(sense);
    }
    return specialSenses;
}




export type SensePrecision = "precise"|"imprecise"|"vague";

export function modifyAllSaves(creature: CreatureSystems, value: number) {
    creature.saves.reflex.value += value;
    creature.saves.fortitude.value += value;
    creature.saves.will.value += value;
}

export interface Attributes {
    ac: ValueHolder;
    allSaves: string;
    hp: ValueHolder;
    speed: SpeedValue;
    resistances: TypedValue[];
    weaknesses: TypedValue[];
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

    let selectedItems = allItems.filter(item => {
        return (
            !spells.includes(item as CreatureItemSpell)
            && !strikes.baseStrikes.includes(item as CreatureItemStrike)
            && item.type != "weapon"
            && item.type != "armor"
            && item.type != "spellcastingEntry"
            && item.type != "lore"
            && item.type != "equipment"
            && item.type != "ammo"
            && item.type != "condition"
            && item.type != "shield"
            && item.system.slug != "push"
            && item.system.slug != "improved-push"
            && item.system.slug != "grab"
            && item.system.slug != "improved-grab"
            && item.system.slug != "knockdown"
            && item.system.slug != "improved-knockdown"
            && item.system.slug != "telepathy"
            && item.system.slug != "constant-spells"
            && item.system.slug != "1-status-to-all-saves-vs-magic"
            && item.system.slug != "shield-block"
            && item.system.slug != "negative-healing"
            && item.system.slug != "void-healing"
            && item.system.slug != "regeneration"
            && item.system.slug != "fast-healing"
            && !(item.system.slug === "reactive-strike" && (item.name === "Reactive Strike" || item.name === "Attack of Opportunity"))
            && !(item.system.slug === "attack-of-opportunity" && (item.name === "Reactive Strike" || item.name === "Attack of Opportunity"))
        )
    })

    selectedItems = selectedItems.sort((a, b) => {

        // 1) Map actionType → rank order
        const typeRank = {
            action: 0,
            reaction: 1,
            passive: 2
        };

        const aType : string = a.system.actionType?.value.toLowerCase() ?? "";
        const bType : string = b.system.actionType?.value.toLowerCase() ?? "";

        // Compare type first
        if (typeRank[aType as keyof typeof typeRank] !== typeRank[bType as keyof typeof typeRank]) {
            return typeRank[aType as keyof typeof typeRank] - typeRank[bType as keyof typeof typeRank];
        }

        // 2) If both are action: order by action number
        if (aType === "action") {
            const aActions = a.system.actions?.value ?? 0;  // treat null as 0
            const bActions = b.system.actions?.value ?? 0;

            if (aActions !== bActions) {
                return aActions - bActions; // fewer actions first
            }
        }

        // 3) Alphabetical fallback
        return a.name.localeCompare(b.name);
    });
    
    return selectedItems;
    
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
    actions: NullableValueHolder | null,
    actionType : StringHolder,
    rules : Rule[]
}

export interface Rule {
    predicate: string[];
    attackModifier?: number;
    key: string;
    damage?: Damage;
    damageType?: string;
    value?: any;
    selector: string;
}

export interface Damage {
    base: {damageType: string, dice: number, die: string}
}

export interface LoreItemSystem extends ItemSystem {
    mod: NullableValueHolder;
}

export interface Stats {
    compendiumSource: string;
}

export interface Mod {
    mod: number;
}

export interface NullableValueHolder {
    type?: string;
    value: number | null;
}

export function NullableValueChange(x : NullableValueHolder, value : number)
{
    if (x.value === null)
        return;
    x.value += value;
}

export function GetValue(x: NullableValueHolder): number {
    if (x.value === null)
        return 0;
    return x.value;
}

export interface ValueHolder{
    value: number;
}

export interface TypedValue {
    type: string;
    value: number;
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
    category?: string;
}

export interface DiceAndModifier {
    diceType: number | null;
    diceNumber: number | null;
    modifier: number;
}

export function GetDice(value: DamageRollInfo): DiceAndModifier
{
    const dicePattern = /(\d+)d(\d+)([+-]\d+)?/i; // matches e.g. 2d6, 3d10+5, 12d4-3
    const staticDamagePattern = /(\d+)/;
    
    const matchDice = value.damage.toString().match(dicePattern);

    if (matchDice)
    {
        const diceNumber = parseInt(matchDice[1], 10);
        const diceType = parseInt(matchDice[2], 10);
        const modifier = matchDice[3] ? parseInt(matchDice[3], 10) : 0;

        return {
            diceType,
            diceNumber,
            modifier
        };
    }
    
    const matchStatic = value.damage.toString().match(staticDamagePattern);
    
    if(matchStatic)
    {
        return {
            diceType: null,
            diceNumber: null,
            modifier: parseInt(matchStatic[1])
        };
    }

    throw new Error(`Invalid dice format: ${value.damage}`);
}

export function DiceString(value: DiceAndModifier): string 
{
    if (value.diceNumber !== null && value.diceType !== null)
        return (value.diceNumber.toString() + "d" + value.diceType.toString() + (value.modifier === 0 ? "" : printNumberWithSignalString(value.modifier)));
    else 
        return (value.modifier === 0 ? "" : printNumberWithSignalString(value.modifier));
}

export interface Details {
    level: {value: number};
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
        return (<span className="pathfinder-action">R</span>);

    if (value.system.actionType.value === "free")
        return (<span className="pathfinder-action">F</span>);
    
    if (value.system.actionType.value === "passive")
        return null;
    
    if (value.system.actions === undefined)
        return null;
    if (value.system.actions?.value === undefined)
        return null;
    
    if (value.system.actions.value === 0)
        return null;
    
    switch (value.system.actions.value){
        case 1:
            return (<span className="pathfinder-action">A</span>);
        case 2:
            return (<span className="pathfinder-action">D</span>);
        default:
            return (<span className="pathfinder-action">T</span>);
    }
}

function statBlock(value: StatBlockProp | undefined, isDescriptionOpen: boolean, setIsDescriptionOpen: ((a:boolean)=>void) ) {

    if(value === undefined)
        return (<p className="italic text-gray-400 px-3 py-1">Select a creature</p>)
    
    return (<div className="px-3 py-1">
        <h1 className="space-x-6 font-semibold">
            <span>{value.name}</span>
            <span>{value.system.details.level.value}</span>
        </h1>
        {printTraitsTransformElement(value.system.traits, (s) => {
            return (
                <p className={`inline-block ${GetTraitColor(s)} text-white border-double border-2 border-[#d5c489] font-semibold text-[1.0em] not-italic px-[5px] text-left indent-0 my-[0.1em]`}>{s.toString()}</p>)
        })}
        {DescriptionArea(isDescriptionOpen, setIsDescriptionOpen, value)}
        {value.system.details.languages.value.length > 0 && (<>
            <hr/>
            <b>Languages: </b> {value.system.details.languages.value.map((l, index) => {
                return ((index === 0 ? "" : ", ") + capitalize(l))
            }
        )}</>)}{value.system.details.languages?.details && (<>, ({value.system.details.languages?.details})</>)}
        <hr/>
        {PrintPerceptionLine(value)}
        <br/>
        <b>Skills</b> {printSkills(value, value.system.skills)}<br/>
        <hr/>
        <span
            className="flex gap-1 items-center">{printValue(value.system.attributes.ac, "AC")}{";"}{PrintShield(value)}</span>
        {printValueWithSignal(value.system.saves.fortitude, "Fort")}{";"}
        {printValueWithSignal(value.system.saves.reflex, "Ref")}{";"}
        {printValueWithSignal(value.system.saves.will, "Will")}
        {value.items.some(i => i.system?.slug === "1-status-to-all-saves-vs-magic") && 
            (
            <span className="text-gray-500 italic"> {" "}
                {
                    (value.items.find((i) => i.system?.slug === "1-status-to-all-saves-vs-magic"))?.name
                }
            </span>
        )}
        <br></br>
        {PrintHP(value)}
        {isVoidHealing(value) ? ` (void healing)` : null}
        {GetFastHealing(value) !== undefined ? ` (${GetFastHealing(value)?.name})` : null}
        {GetRegeneration(value) !== undefined ? ` (${GetRegeneration(value)?.name})` : null}
        {PrintResistances(value)}
        {PrintWeakness(value)}
        {PrintImmunity(value)}
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
        <span className="flex align-middle"><h2>Strikes</h2><span
            className="ml-2 flex">{PrintReactiveStrikeLabel(value)}</span></span>
        <ul className="undottedList">
            {GetCombinedStrikes(GetStrikes(value)).map(i => <li>{PrintStrike(value, i)}</li>)}
        </ul>
        <ul className="undottedList">
            {GetGenericAbilities(value).map(abilityItem => (
                <li className="py-1 border-t-2 border-amber-300">
                    <span
                        className="text-lg pr-2">{GetActionIcon(abilityItem)}{abilityItem.name}</span>{abilityItem.system.traits.value?.length > 0 ?
                    <span
                        className="text-stone-500">({printTraitsSeparator(abilityItem.system.traits, ", ")})</span> : null}
                    <p dangerouslySetInnerHTML={{__html: parseAbilityDescription(abilityItem.system.description.value)}}></p>
                </li>))}
        </ul>
        {HasSpells(value) ? (<>
            <h2>Spells</h2>
            {PrintAllSpells(value)}
        </>) : <></>}
    </div>)
}

function DescriptionArea(isDescriptionOpen: boolean, setIsDescriptionOpen: (a: boolean) => void, value: StatBlockProp) 
{
    return (isDescriptionOpen ?
        (<>
            <p className="" dangerouslySetInnerHTML={{__html: value.system.details.publicNotes}}></p>
            <span className="text-sm italic pl-2 text-gray-400 select-none cursor-pointer" onClick={() => {setIsDescriptionOpen(false)}}>Hide</span>
        </>)
        : <><span className="flex items-center gap-0">
            <span className="line-clamp-1 truncate max-w-xs" dangerouslySetInnerHTML={{__html: value.system.details.publicNotes}}></span> <span className="text-sm italic pl-2 text-gray-400 select-none cursor-pointer" onClick={() => {setIsDescriptionOpen(true)}}>Read More</span>
            </span>
        </>);
}

function PrintPerceptionLine(value: StatBlockProp)
{
    return (<><b>Perception</b> {printNumberWithSignalString(value.system.perception.mod)}
        {GetDarknessVision(value.system.perception)&&` ;${GetDarknessVision(value.system.perception)?.type}`}
        {GetSpecialSenses(value.system.perception).map(sense => {return ` (${sense.acuity} ${sense.type} ${sense.range&&`${sense.range} feet`})`})}
    </>);
}

export function cloneStatBlock(statBlock: StatBlockProp): StatBlockProp 
{
    return {
        _id: crypto.randomUUID(), // give the clone a new id
        name: statBlock.name,
        system: JSON.parse(JSON.stringify(statBlock.system)) as CreatureSystems,
        items: statBlock.items.map(item => ({
            ...JSON.parse(JSON.stringify(item))
        }))
    };
}

function printMod(mod: Mod, name: string) {
    const val = mod.mod;

    if (val === 0) return <> <b>{name}</b> 0</>;
    if (val < 0) return <> <b>{name}</b> {val}</>;
    return <> <b>{name}</b> +{val}</>;
}

export function printValue(value: NullableValueHolder, name: string) {
    const val = value.value;
    return <> <b>{name}</b> {val}</>;
}

function printValueWithSignal(value: NullableValueHolder, name: string) {
    const val = GetValue(value);
    return <> <b>{name}</b> {val < 0 ? "" : "+"}{val}</>;
}

export function printNumberWithSignalElement(value: number | null) {
    
    if (value == null) {
        return printNumberWithSignalElement(0);
    }
    
    const val = value;
    return <>{val < 0 ? "" : "+"}{val}</>;
}

export function printNumberWithSignalString(value: number | null) {
    
    if (value == null){
        return printNumberWithSignalString(0);
    }
    
    const val = value;
    return ((val < 0 ? "" : "+") + (val));
}

export default statBlock;



