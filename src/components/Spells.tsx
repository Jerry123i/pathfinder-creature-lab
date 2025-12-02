import {
    type CreatureItem,
    type ItemSystem,
    type StatBlockProp,
    type NullableValueHolder,
} from "./StatBlock.tsx";
import {Fragment} from "react";

export type SpellTraditions = "arcane" | "divine" | "primal" | "occult";

export interface SpellcastingItem extends CreatureItem{
    system: SpellcasterEntrySystem;
}

export interface SpontaneousSpellcastingItem extends SpellcastingItem {
    system: SpontaneousSpellcasterEntrySystem;
}

export interface PreparedSpellcastingItem extends SpellcastingItem {
    system: PreparedSpellcasterEntrySystem;
}

interface SpontaneousSpellSlot extends SpellSlot{
    value : number;
}

interface PreparedSpellSlot extends SpellSlot{
    prepared: {id:string}[];
}

interface SpellSlot {
    max : number;
}

interface PreparedSpellList extends SpellSlotsList
{
    slot0? : PreparedSpellSlot;
    slot1? : PreparedSpellSlot;
    slot2? : PreparedSpellSlot;
    slot3? : PreparedSpellSlot;
    slot4? : PreparedSpellSlot;
    slot5? : PreparedSpellSlot;
    slot6? : PreparedSpellSlot;
    slot7? : PreparedSpellSlot;
    slot8? : PreparedSpellSlot;
    slot9? : PreparedSpellSlot;
    slot10? : PreparedSpellSlot;    
}

interface SpontaneousSpellList extends SpellSlotsList
{
    slot0? : SpontaneousSpellSlot;
    slot1? : SpontaneousSpellSlot;
    slot2? : SpontaneousSpellSlot;
    slot3? : SpontaneousSpellSlot;
    slot4? : SpontaneousSpellSlot;
    slot5? : SpontaneousSpellSlot;
    slot6? : SpontaneousSpellSlot;
    slot7? : SpontaneousSpellSlot;
    slot8? : SpontaneousSpellSlot;
    slot9? : SpontaneousSpellSlot;
    slot10? : SpontaneousSpellSlot;
}

interface SpellSlotsList
{
    slot0? : SpellSlot;
    slot1? : SpellSlot;
    slot2? : SpellSlot;
    slot3? : SpellSlot;
    slot4? : SpellSlot;
    slot5? : SpellSlot;
    slot6? : SpellSlot;
    slot7? : SpellSlot;
    slot8? : SpellSlot;
    slot9? : SpellSlot;
    slot10? : SpellSlot;
}

function GetSpellSlot(list: SpellSlotsList, index: number) : SpellSlot | undefined
{
    switch (index){
        case 0:
            return list.slot0;
        case 1:
            return list.slot1;
        case 2:
            return list.slot2;
        case 3:
            return list.slot3;
        case 4:
            return list.slot4;
        case 5:
            return list.slot5;
        case 6:
            return list.slot6;
        case 7:
            return list.slot7;
        case 8:
            return list.slot8;
        case 9:
            return list.slot9;
        case 10:
            return list.slot10;
    }
    return undefined;
}

export interface SpellcasterEntrySystem extends ItemSystem {
    spelldc : {dc:number, mod: number, value:number};
    tradition : {value:SpellTraditions};
    prepared: {value: "spontaneous"|"prepared"|"innate"|"focus"};
}

export interface SpontaneousSpellcasterEntrySystem extends SpellcasterEntrySystem
{
    slots: SpontaneousSpellList;  
}

export interface PreparedSpellcasterEntrySystem extends SpellcasterEntrySystem{
    slots: PreparedSpellList;
}

export function GetSpells(value: StatBlockProp): CreatureItemSpell[] {
    return value.items.filter(item => item.type === "spell") as CreatureItemSpell[];
}

function GetSpellListsWithSpell(value: StatBlockProp): {spellList:SpellcastingItem, spells: CreatureItemSpell[]}[]
{
    const spellcastingEntries = value.items.filter(item => item.type === "spellcastingEntry") as SpellcastingItem[];
    const spells = value.items.filter(item => item.type === "spell") as CreatureItemSpell[];
    
    const finalList :{spellList:SpellcastingItem, spells: CreatureItemSpell[]}[] = [];

    for (let i = 0; i < spellcastingEntries.length; i++)
    {
        finalList.push({spellList:spellcastingEntries[i], spells:[]})    
    }
    
    for (const spell of spells)
    {
        finalList.find(list => {return list.spellList._id === spell.system.location.value})?.spells.push(spell);
    }
    
    return finalList
}

export function GetSpellcastingEntry(value: StatBlockProp) : SpellcastingItem | null
{
    for (let i = 0; i < value.items.length; i++)
    {
        const item = value.items[i];
        if (item.type === "spellcastingEntry")
            return item as SpellcastingItem;
    }
    return null;
}

export function modifySpellDc(creature : StatBlockProp, value : number)
{
    if (!HasSpells(creature))
        return;
    
    const spellCasting = GetSpellcastingEntry(creature);
    
    if (spellCasting === null)
        return;
    
    spellCasting.system.spelldc.dc += value;
    spellCasting.system.spelldc.value += value;
}

export interface SpellSystem extends ItemSystem {
    level: NullableValueHolder;
    location: {heightenedLevel: number, value:string}; //TODO this declaration might be dangerous
}

export interface CreatureItemSpell extends CreatureItem {
    system: SpellSystem;
}

function GetActiveLevel(spell : SpellSystem): number{
    
    if (spell.location?.heightenedLevel > (spell.level.value ?? 0))
        return spell.location.heightenedLevel;
    
    return (spell.level.value ?? 0)
}

export function HasSpells(creature : StatBlockProp){
    return GetSpells(creature).length > 0;
}

export function PrintAllSpells(creature: StatBlockProp) { 
    const allSpellLists = GetSpellListsWithSpell(creature);
    
    const spellListsCombination = []
    
    for (const spellList of allSpellLists)
    {
        spellListsCombination.push(PrintSpellcastingEntry(spellList));
    }
    
    return (<span className="space-y-4 flex space-x-2">{spellListsCombination}</span>);
}

function PrintSpellcastingEntry(value:{spellList:SpellcastingItem, spells: CreatureItemSpell[]})
{
    if (value.spellList.system.prepared.value === "spontaneous")
        return PrintSpontaneousSpells({spellcaster: value.spellList as SpontaneousSpellcastingItem, spells: value.spells})
    else if (value.spellList.system.prepared.value === "prepared")
        return PrintPreparedSpells({spellcaster: value.spellList as PreparedSpellcastingItem, spells: value.spells})
    else
        return PrintInnateSpells({spellcaster:value.spellList, spells: value.spells})
}

function PrintSpontaneousSpells(value:{spellcaster:SpontaneousSpellcastingItem, spells: CreatureItemSpell[]})
{
    const spells = value.spells;

    spells.sort((a, b) => GetActiveLevel(a.system) - GetActiveLevel(b.system));

    let lastLevel = -1;

    return (
        <table className="spellTable">
            <thead>
            <tr className="spellCell">
                <th className="spellHeader bg-violet-300">{value.spellcaster.name} : DC{value.spellcaster.system.spelldc.dc}</th>
            </tr>
            </thead>
            <tbody>
            {spells.some(x=> x.system.traits.value.includes("cantrip"))&&
                <>
                <tr className="spellCell" key={`header-cantrip`}>
                    <th className="spellHeader"><span>Cantrips</span></th>
                </tr>
                    {spells.filter(x=> x.system.traits.value.includes("cantrip")).map((spell)=>{
                        return(
                            <Fragment key={spell._id}>
                                <tr className="spellCell">
                                    <td className="spellContent">{spell.name}</td>
                                </tr>
                            </Fragment>
                        )
                    })}
                </>
            }
            {spells.map((spell) =>
            {
                if (spell.system.traits.value.includes("cantrip"))
                    return;
                
                const level = GetActiveLevel(spell.system);
                const levelHeader =
                    level > lastLevel ? (
                        <tr className="spellCell" key={`header-${level}`}>
                            <th className="spellHeader"><span>Level {level}</span><span className="spellLevelField">{GetSpellSlot(value.spellcaster.system.slots, level)?.max}</span></th>
                        </tr>
                    ) : null;

                lastLevel = level;

                return (
                    <Fragment key={spell._id}>
                        {levelHeader}
                        <tr className="spellCell">
                            <td className="spellContent">{spell.name}</td>
                        </tr>
                    </Fragment>
                );
            })}
            </tbody>
        </table>
    );
}

function PrintPreparedSpells(value:{spellcaster:PreparedSpellcastingItem, spells: CreatureItemSpell[]}) 
{
    const spells = value.spells;
    
    return (<table className="spellTable">
            <thead>
            <tr className="spellCell">
                <th className="spellHeader bg-violet-300">{value.spellcaster.name} : DC{value.spellcaster.system.spelldc.dc}</th>
            </tr>
            </thead>
            <tbody>
            {[0,1,2,3,4,5,6,7,8,9,10].map((index) =>
            {
                const slot = GetSpellSlot(value.spellcaster.system.slots, index);

                if (slot !== undefined)
                {
                    const header = index>0?
                        (<th className="spellHeader"><span>Level {index}</span><span className="spellLevelField">{GetSpellSlot(value.spellcaster.system.slots, index)?.max}</span></th>):
                        (<th className="spellHeader"><span>Cantrips</span></th>);
                    
                    const prep = slot as PreparedSpellSlot;
                    return prep.prepared.map((spellId, index) =>  {return (
                        <>
                            {index===0?header:null}
                            <tr className="spellCell">
                                <td className="spellContent">{spells.find(v=> {return v._id === spellId.id})?.name}</td>
                            </tr>
                        </>
                    )});
                }
            })}
            </tbody>
        </table>
    );
}

function PrintInnateSpells(value:{spellcaster:SpellcastingItem, spells: CreatureItemSpell[]})
{
    const spells = value.spells;

    spells.sort((a, b) => GetActiveLevel(a.system) - GetActiveLevel(b.system));

    let lastLevel = -1;

    return (
        <table className="spellTable">
            <thead>
            <tr className="spellCell">
                <th className="spellHeader bg-violet-300">{value.spellcaster.name} : DC{value.spellcaster.system.spelldc.dc}</th>
            </tr>
            </thead>
            <tbody>
            {spells.some(x=> x.system.traits.value.includes("cantrip"))&&
                <>
                    <tr className="spellCell" key={`header-cantrip`}>
                        <th className="spellHeader"><span>Cantrips</span></th>
                    </tr>
                    {spells.filter(x=> x.system.traits.value.includes("cantrip")).map((spell)=>{
                        return(
                            <Fragment key={spell._id}>
                                <tr className="spellCell">
                                    <td className="spellContent">{spell.name}</td>
                                </tr>
                            </Fragment>
                        )
                    })}
                </>
            }
            {spells.map((spell) =>
            {
                if (spell.system.traits.value.includes("cantrip"))
                    return;

                const level = GetActiveLevel(spell.system);
                const levelHeader =
                    level > lastLevel ? (
                        <tr className="spellCell" key={`header-${level}`}>
                            <th className="spellHeader"><span>Level {level}</span></th>
                        </tr>
                    ) : null;

                lastLevel = level;

                return (
                    <Fragment key={spell._id}>
                        {levelHeader}
                        <tr className="spellCell">
                            <td className="spellContent">{spell.name}</td>
                        </tr>
                    </Fragment>
                );
            })}
            </tbody>
        </table>
    );
}

function GetSpellFromId(creature:StatBlockProp ,id:string) : CreatureItemSpell | undefined
{
    const spell = (creature.items.find(v => v._id === id) as CreatureItemSpell);
    return spell;    
}

//<th key={spell._id}>{spell.name}</th>