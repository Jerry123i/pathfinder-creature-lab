import {capitalize} from "./TypeScriptHelpFunctions.tsx";
import {Fragment} from "react";
import type {StatBlockProp} from "./StatBlock.tsx";

export interface Traits {
    rarity: string;
    size: { value: string };
    value: string[];
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

export function ReplaceTrait(creature : StatBlockProp, valueToRemove : string, valueToPlace)
{
    if (!creature.system.traits.value.includes(valueToRemove))
    {
        AddTrait(creature,valueToPlace);
        return;
    }
        
    const index = creature.system.traits.value.indexOf(valueToRemove);
    RemoveTrait(creature,valueToRemove);
    
    creature.system.traits.value.splice(index, 0, valueToPlace); 
    
}

export function traitsCleanup(value: string[]) {
    for (let i = 0; i < value.length; i++) {
        if (value[i] === "med")
            value[i] = "medium";

        if (value[i] === "lg")
            value[i] = "large";
        
        if(value[i] === "sm")
            value[i] = "small";
        
        if (value[i]=== "grg")
            value[i] = "gargantuan";

        value[i] = capitalize(value[i]);
    }

    return value;
}

export function printTraitsTransform(value: Traits, stringTransform: (s: string, i: number) => string) {
    const parts: string[] = [];

    if (value?.rarity && value.rarity.toLowerCase() !== "common") {
        parts.push(value.rarity);
    }

    if (value?.size?.value) {
        parts.push(value.size.value);
    }

    const cleanedParts = traitsCleanup(parts);

    const traits = value?.value ?? [];
    const startIndex = cleanedParts.length;
    const transformedParts = [
        ...cleanedParts.map((part, i) => stringTransform(part, i)),
        ...traits.map((trait, index) => stringTransform(capitalize(trait), startIndex + index)),
    ];

    return <>{transformedParts}</>;
}

export function printTraitsTransformElement(value: Traits, stringTransform: (s: string, i: number) => React.ReactNode) {
    const parts: string[] = [];

    if (value?.rarity && value.rarity.toLowerCase() !== "common") {
        parts.push(value.rarity);
    }

    if (value?.size?.value) {
        parts.push(value.size.value);
    }

    const traits = value?.value ?? [];
    const startIndex = parts.length;

    const cleanedParts = traitsCleanup(parts);

    const transformedParts = [
        ...cleanedParts.map((part, i) => (
            <Fragment key={`base-${i}`}>
                {stringTransform(part, i)}
            </Fragment>
        )),
        ...traits.map((trait, index) => (
            <Fragment key={`trait-${startIndex + index}`}>
                {stringTransform(capitalize(trait), startIndex + index)}
            </Fragment>
        )),
    ];

    return <>{transformedParts}</>;
}

export function printTraitsSeparator(value: Traits, separator: string) {

    return printTraitsTransform(value, (s, i) => {
        return i === 0 ? s : (separator) + s;
    })
}

export function GetTraitColor(str: string) : string 
{
    if (str.toLowerCase() === "rare")
        return "bg-[#000088]";

    if (str.toLowerCase() === "uncommon")
        return "bg-[#c45500]";
    
    if (str.toLowerCase() === "unique")
        return "bg-[#800080]"

    if (str.toLowerCase() === "tiny" || str.toLowerCase() === "medium" || str.toLowerCase() === "large" || str.toLowerCase() === "huge" || str.toLowerCase() === "gargantuan" || str.toLowerCase() === "small")
        return "bg-[#478c42]";
    
    return "bg-[#531004]";
}