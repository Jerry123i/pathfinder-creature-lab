import type {CreatureItem, ItemSystem, StatBlockProp, ValueHolder} from "./StatBlock.tsx";
import {Fragment} from "react";

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

export function GetSpellcastingEntry(value: StatBlockProp) : SpellcastingItem
{
    for (let i = 0; i < value.items.length; i++)
    {
        const item = value.items[i];
        if (item.type === "spellcastingEntry")
            return item as SpellcastingItem;
    }
    let notFound : SpellcastingItem;
    return notFound;
}

export function ModifySpellDc(creature : StatBlockProp, value : number)
{
    if (!HasSpells(creature))
        return;
    
    GetSpellcastingEntry(creature).system.spelldc.dc += value;
    GetSpellcastingEntry(creature).system.spelldc.value += value;
}

export interface SpellSystem extends ItemSystem {
    level: ValueHolder;
    location: {heightenedLevel: number, value:number}; //TODO this declaration might be dangerous
}

export interface CreatureItemSpell extends CreatureItem {
    system: SpellSystem;
}

function GetActiveLevel(spell : SpellSystem): number{
    
    if (spell.location?.heightenedLevel > spell.level.value)
        return spell.location.heightenedLevel;
    
    return spell.level.value
}

export function HasSpells(creature : StatBlockProp){
    return GetSpells(creature).length > 0;
}

export function PrintSpells(creature: StatBlockProp) { //TODO Separate different spellcasting entries
    const spells = GetSpells(creature);

    spells.sort((a, b) => GetActiveLevel(a.system) - GetActiveLevel(b.system));
    
    const spellcasting = GetSpellcastingEntry(creature);
    let lastLevel = -1;

    return (
        <table>
            <thead>
            <tr>
                <th>{spellcasting.name} : DC{spellcasting.system.spelldc.dc}</th>
            </tr>
            </thead>
            <tbody>
            {spells.map((spell, index) => {
                const level = GetActiveLevel(spell.system);
                const levelHeader =
                    level > lastLevel ? (
                        <tr key={`header-${level}`}>
                            <th>Level {level}</th>
                        </tr>
                    ) : null;

                lastLevel = level;

                return (
                    <Fragment key={spell._id}>
                        {levelHeader}
                        <tr>
                            <td>{spell.name}</td>
                        </tr>
                    </Fragment>
                );
            })}
            </tbody>
        </table>
    );

}

//<th key={spell._id}>{spell.name}</th>