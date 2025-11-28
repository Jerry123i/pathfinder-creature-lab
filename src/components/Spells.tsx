import {
    type CreatureItem,
    type ItemSystem,
    type StatBlockProp,
    type NullableValueHolder,
    GetGenericAbilities
} from "./StatBlock.tsx";
import {Fragment} from "react";
import {capitalize} from "./TypeScriptHelpFunctions.tsx";
import {checkRegex} from "./Parsing.tsx";

export type SpellTraditions = "arcane" | "divine" | "primal" | "occult";

export interface SpellcastingItem extends CreatureItem{
    system: SpellcasterEntrySystem;
}

export interface SpellcasterEntrySystem extends ItemSystem{
    spelldc : {dc:number, mod: number, value:number};
    tradition : {value:SpellTraditions}
}

export function GetSpells(value: StatBlockProp): CreatureItemSpell[] {
    return value.items.filter(item => item.type === "spell") as CreatureItemSpell[];
}

function GetSpellCastingLists(value: StatBlockProp): SpellcastingList[] {
    const spellcastingEntries = value.items.filter(item => item.type === "spellcastingEntry") as SpellcastingItem[];
    const spells = value.items.filter(item => item.type === "spell") as CreatureItemSpell[];
    
    const finalList :SpellcastingList[] = [];
    
    for(const spellList of spellcastingEntries)
    {
        finalList.push( {id: spellList._id, name:spellList.name, spells: [], dc: spellList.system.spelldc.dc, tradition: spellList.system.tradition} )
    }
    
    for (const spell of spells)
    {
        finalList.find(list => {return list.id === spell.system.location.value})?.spells.push(spell);
    }
    
    return finalList
    
}

export interface SpellcastingList{
    id: string;
    name: string;
    dc : number;
    tradition : {value:SpellTraditions}
    spells: CreatureItemSpell[];
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

export function PrintAllSpells(creature: StatBlockProp) { //TODO Separate different spellcasting entries
    const allSpellLists = GetSpellCastingLists(creature);
    
    const spellListsCombination = []
    
    for (const spellList of allSpellLists)
    {
        spellListsCombination.push(PrintSpellcastingEntry(spellList));
    }
    
    return (<span className="space-y-4 flex space-x-2">{spellListsCombination}</span>);
}

function PrintSpellcastingEntry(list: SpellcastingList)
{
    const spells = list.spells;
    
    spells.sort((a, b) => GetActiveLevel(a.system) - GetActiveLevel(b.system));

    let lastLevel = -1;

    return (
        <table className="h-0 w-80 table-auto border-1 border-black p-2">
            <thead>
            <tr>
                <th className="bg-violet-300 px-2 py-0.5">{list.name} : DC{list.dc}</th>
            </tr>
            </thead>
            <tbody>
            {spells.map((spell) => {
                const level = GetActiveLevel(spell.system);
                const levelHeader =
                    level > lastLevel ? (
                        <tr key={`header-${level}`}>
                            <th className="px-2 py-0.5 bg-violet-400">Level {level}</th>
                        </tr>
                    ) : null;

                lastLevel = level;

                return (
                    <Fragment key={spell._id}>
                        {levelHeader}
                        <tr className="odd:bg-violet-100 not-odd:bg-gray-100">
                            <td className="px-2 py-1  ">{spell.name}</td>
                        </tr>
                    </Fragment>
                );
            })}
            </tbody>
        </table>
    );
}

//<th key={spell._id}>{spell.name}</th>