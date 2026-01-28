import {
    type GMTable,
    nextTier,
    type RangeLevelLookupTable,
    type Range,
    type AttributeTiers,
    previousTier, GetGMTableValue
} from "../components/LookupTable.tsx";
import {inLerp, lerp} from "../components/LinearInterpolation.tsx";
import type {StatsJson} from "../components/StatBlock.tsx";
import type {AbilityName} from "../components/Abilities.tsx";
import {type CreatureItemStrike, getDamageAverage} from "../components/Strikes.tsx";

export const attributeModifierScales : GMTable<number> =
{
    extreme:    [ 4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 9,10,10,10,11,11,11,12,12,13],
    high:       [ 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9,10,10,10,10,10,12],
    moderate:   [ 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 8, 8, 9],
    low:        [ 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7],
    terrible:   Array(26).fill(-4),
    type : "number"
}

export function getScaledAttribute(creature : StatsJson, attribute : AbilityName, levelTarget : number): number{
    return getAdjustedLevel(creature.system.details.level.value, levelTarget, creature.system.abilities[attribute].mod, attributeModifierScales)
}

export const perceptionScales : GMTable<number> =
{
    extreme:    [ 9,10,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,43,44,46],
    high:       [ 8, 9,10,11,12,14,15,17,18,19,21,22,24,25,26,28,29,30,32,33,35,36,38,39,40,42],
    moderate:   [ 5, 6, 7, 8, 9,11,12,14,15,16,18,19,21,22,23,25,26,28,29,30,32,33,35,36,37,38],
    low:        [ 2, 3, 4, 5, 6, 8, 9,11,12,13,15,16,18,19,20,22,23,25,26,27,29,30,32,33,34,36],
    terrible:   [ 0, 1, 2, 3, 4, 6, 7, 8,10,11,12,14,15,16,18,19,20,22,23,24,26,27,28,30,31,32],
    type : "number"
}

export function getScaledPerception(creature :StatsJson, levelTarget : number): number{
    return getAdjustedLevel(creature.system.details.level.value, levelTarget, creature.system.perception.mod, perceptionScales)
}

const skillLowRanges: [number, number][] = [
    [1,2],[2,3],[3,4],[4,5],[5,7],[7,8],[8,10],[9,11],
    [11,13],[12,14],[13,16],[15,17],[16,19],[17,20],
    [19,22],[20,23],[21,25],[23,26],[24,28],[25,29],
    [27,31],[28,32],[29,34],[31,35],[32,36],[33,38],
];

export const skillsScales : GMTable<Range|number> =
{
    extreme:    [ 8, 9,10,11,13,15,16,18,20,21,23,25,26,28,30,31,33,35,36,38,40,41,43,45,46,48],
    high:       [ 5, 6, 7, 8,10,12,13,15,17,18,20,22,23,25,27,28,30,32,33,35,37,38,40,42,43,45],
    moderate:   [ 4, 5, 6, 7, 9,10,12,13,15,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,38,40],
    low:        skillLowRanges.map(([min, max]) => ({ min, max })),
    terrible:   Array(26).fill(0),
    type : "range"
}

export function getScaledSkill(levelInput :number, levelTarget : number, value : number): number{
    return getAdjustedLevel(levelInput, levelTarget, value, skillsScales)
}
 
export const armorClassScales : GMTable<number> = 
{
    extreme:  [18,19,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45,46,48,49,51,52,54],
    high:     [15,16,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45,46,48,49,51],
    moderate: [14,15,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,42,44,45,47,48,50],
    low:      [12,13,13,15,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45,46,48],
    terrible: Array.from({ length: 26 }, () => 1),
    type : "number"
}

export function getScaledArmor(creature :StatsJson, levelTarget : number): number{
    return getAdjustedLevel(creature.system.details.level.value, levelTarget, creature.system.attributes.ac.value, armorClassScales)
}

export const savingThrowScales: GMTable<number> = {
    extreme:  [ 9,10,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,43,44,46 ],
    high:     [ 8, 9,10,11,12,14,15,17,18,19,21,22,24,25,26,28,29,30,32,33,35,36,38,39,40,42 ],
    moderate: [ 5, 6, 7, 8, 9,11,12,14,15,16,18,19,21,22,23,25,26,28,29,30,32,33,35,36,37,38 ],
    low:      [ 2, 3, 4, 5, 6, 8, 9,11,12,13,15,16,18,19,20,22,23,25,26,27,29,30,32,33,34,36 ],
    terrible: [ 0, 1, 2, 3, 4, 6, 7, 8,10,11,12,14,15,16,18,19,20,22,23,24,26,27,28,30,31,32 ],
    type : "number"
};

export function getScaledWill(creature :StatsJson, levelTarget : number): number{
    return getAdjustedLevel(creature.system.details.level.value, levelTarget, creature.system.saves.will.value, savingThrowScales)
}
export function getScaledFortitude(creature :StatsJson, levelTarget : number): number{
    return getAdjustedLevel(creature.system.details.level.value, levelTarget, creature.system.saves.fortitude.value, savingThrowScales)
}
export function getScaledReflex(creature :StatsJson, levelTarget : number): number{
    return getAdjustedLevel(creature.system.details.level.value, levelTarget, creature.system.saves.reflex.value, savingThrowScales)
}

const hpHighRanges: [number, number][] = [
    [9,9],[17,20],[24,26],[36,40],[53,59],[72,78],[91,97],[115,123],
    [140,148],[165,173],[190,198],[215,223],[240,248],[265,273],
    [290,298],[315,323],[340,348],[365,373],[390,398],[415,423],
    [440,448],[465,473],[495,505],[532,544],[569,581],[617,633],
];

const hpModerateRanges: [number, number][] = [
    [7,8],[14,16],[19,21],[28,32],[42,48],[57,63],[72,78],[91,99],
    [111,119],[131,139],[151,159],[171,179],[191,199],[211,219],
    [231,239],[251,259],[271,279],[291,299],[311,319],[331,339],
    [351,359],[371,379],[395,405],[424,436],[454,466],[492,508],
];

const hpLowRanges: [number, number][] = [
    [5,6],[11,13],[14,16],[21,25],[31,37],[42,48],[53,59],[67,75],
    [82,90],[97,105],[112,120],[127,135],[142,150],[157,165],
    [172,180],[187,195],[202,210],[217,225],[232,240],[247,255],
    [262,270],[277,285],[295,305],[317,329],[339,351],[367,383],
];

export const hitPointScales: GMTable<Range|number> = {
    terrible: Array.from({ length: 26 }, () => 1),
    high:     hpHighRanges.map(([min, max]) => ({ min, max })),
    moderate: hpModerateRanges.map(([min, max]) => ({ min, max })),
    low:      hpLowRanges.map(([min, max]) => ({ min, max })),
    extreme:  Array.from({ length: 26 }, () => 999),
    type : "range"
};

export function getScaledHP(creature :StatsJson, levelTarget : number): number{
    return getAdjustedLevel(creature.system.details.level.value, levelTarget, creature.system.attributes.hp.value, hitPointScales);
}

export const strikeAttackBonusScales: GMTable<number> = {
    extreme:  [10,10,11,13,14,16,17,19,20,22,23,25,27,28,29,31,32,34,35,37,38,40,41,43,44,46],
    high:     [ 8, 8, 9,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,42,44],
    moderate: [ 6, 6, 7, 9,10,12,13,15,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42],
    low:      [ 4, 4, 5, 7, 8, 9,11,12,13,15,16,17,19,20,21,23,24,25,27,28,29,31,32,33,35,36],
    terrible: Array.from({ length: 26 }, () => 1),
    type : "number"
};

export function getScaledStrikes(levelInput :number, levelTarget : number, value : number): number{
    return getAdjustedLevel(levelInput, levelTarget, value, strikeAttackBonusScales)
}

export const strikeDamageScales: GMTable<number> = {
    extreme:  [ 4, 6, 8,11,15,18,20,23,25,28,30,33,35,38,40,43,45,48,50,53,55,58,60,63,65,68 ],
    high:     [ 3, 5, 6, 9,12,14,16,18,20,22,24,26,28,30,32,34,36,37,38,40,42,44,46,48,50,52 ],
    moderate: [ 3, 4, 5, 8,10,12,13,15,17,18,20,22,23,25,27,28,30,31,32,33,35,37,38,40,42,44 ],
    low:      [ 2, 3, 4, 6, 8, 9,11,12,13,15,16,17,19,20,21,23,24,25,26,27,28,29,31,32,33,35 ],
    terrible: Array.from({ length: 26 }, () => 1),
    type : "number"
};

export const damageDiceNumberScale : number[] = 
    [1,1,1,1,1,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4];


export function getScaledDamage(levelInput :number, levelTarget : number, value : CreatureItemStrike): number{
    return getAdjustedLevel(levelInput, levelTarget, getDamageAverage(value), strikeDamageScales)
}

export const spellDcScales: GMTable<number> = {
    low: Array.from({ length: 26 }, () => 1),
    terrible: Array.from({ length: 26 }, () => 1),
    extreme:  [19,19,20,22,23,25,26,27,29,30,32,33,34,36,37,39,40,41,43,44,46,47,48,50,51,52],
    high:     [16,16,17,18,20,21,22,24,25,26,28,29,30,32,33,34,36,37,38,40,41,42,44,45,46,48],
    moderate: [13,13,14,15,17,18,19,21,22,23,25,26,27,29,30,31,33,34,35,37,38,39,41,42,43,45],
    type : "number"
};

export function getScaledSpellDc(levelInput :number, levelTarget : number, value : number): number{
    return getAdjustedLevel(levelInput, levelTarget, value, spellDcScales)
}

export const spellAttackScales: GMTable<number> = {
    low: Array.from({ length: 26 }, () => 1),
    terrible: Array.from({ length: 26 }, () => 1),
    extreme:  [11,11,12,14,15,17,18,19,21,22,24,25,26,28,29,31,32,33,35,36,38,39,40,42,43,44],
    high:     [ 8, 8, 9,10,12,13,14,16,17,18,20,21,22,24,25,26,28,29,30,32,33,34,36,37,38,40],
    moderate: [ 5, 5, 6, 7, 9,10,11,13,14,15,17,18,19,21,22,23,25,26,27,29,30,31,33,34,35,37],
    type : "number"
};

export function getScaledSpellAttack(levelInput :number, levelTarget : number, value : number): number{
    return getAdjustedLevel(levelInput, levelTarget, value, spellAttackScales)
}

export function getValueTier(table:GMTable<number|Range>, level : number, value:number): AttributeTiers
{
    const terribleRef = GetGMTableValue(table, "terrible", level);
    const lowRef = GetGMTableValue (table, "low", level);
    const moderateRef = GetGMTableValue (table, "moderate", level);
    const extremeRef = GetGMTableValue (table, "extreme", level);
    const highRef = GetGMTableValue (table, "high", level);

    const comparisons : {label : AttributeTiers, value : number}[] = [
        { label: "terrible", value: Math.abs(compare(terribleRef, value)) },
        { label: "low", value: Math.abs(compare(lowRef, value)) },
        { label: "moderate", value: Math.abs(compare(moderateRef, value)) },
        { label: "high", value: Math.abs(compare(highRef, value)) },
        { label: "extreme", value: Math.abs(compare(extremeRef, value)) },
    ];

    return comparisons.reduce((best, current) =>
        current.value < best.value ? current : best
    ).label;
}

function getTerriblePlusValue(table : GMTable<number|Range>, level : number): number|Range
{
    const terribleValue = GetGMTableValue(table, "terrible", level);
    const lowValue = GetGMTableValue(table, "low", level);
    
    const terribleIsNumber = typeof terribleValue === 'number';
    const lowIsNumber = typeof lowValue === 'number';
    
    if (terribleIsNumber && lowIsNumber){
        const dif = lowValue - terribleValue;
        return terribleValue - dif;
    }
    if (!terribleIsNumber && !lowIsNumber)
    {
        const difMin = (lowValue as Range).min - (terribleValue as Range).min;
        const difMax = (lowValue as Range).max - (terribleValue as Range).max;
        
        return {min : terribleValue.min-difMin, max : terribleValue.max-difMax};
    }
    
    let terribleNew : Range;
    let lowNew : Range;
    
    if(!terribleIsNumber)
        terribleNew = terribleValue as Range;
    else 
        terribleNew = {min:terribleValue, max:terribleValue};
    
    if (!lowIsNumber)
        lowNew = lowValue as Range;
    else 
        lowNew = {min: lowValue, max:lowValue};

    const difMin = lowNew.min - terribleNew.min;
    const difMax = lowNew.max - terribleNew.max;

    return {min : terribleNew.min-difMin, max : terribleNew.max-difMax};
}

function getExtremePlusValue(table : GMTable<number|Range>, level : number): number|Range
{
    const extremeValue = GetGMTableValue(table, "extreme", level);
    const highValue = GetGMTableValue(table, "high", level);

    const extremeIsNumber = typeof extremeValue === 'number';
    const highIsNumber = typeof highValue === 'number';

    if (extremeIsNumber && highIsNumber){
        const dif = extremeValue - highValue;
        return extremeValue + dif;
    }
    if (!extremeIsNumber && !highIsNumber)
    {
        const difMin = (extremeValue as Range).min - (highValue as Range).min;
        const difMax = (extremeValue as Range).max - (highValue as Range).max;

        return {min : extremeValue.min + difMin, max : extremeValue.max + difMax};
    }

    let extremeNew : Range;
    let highNew : Range;

    if(!extremeIsNumber)
        extremeNew = extremeValue as Range;
    else
        extremeNew = {min:extremeValue, max:extremeValue};

    if (!highIsNumber)
        highNew = highValue as Range;
    else
        highNew = {min: highValue, max:highValue};

    const difMin = extremeNew.min - highNew.min;
    const difMax = extremeNew.max - highNew.max;

    return {min : extremeNew.min + difMin, max : extremeNew.max + difMax};
}

function compare(reference:number|Range, value:number)
{
    if (typeof reference === "number") {
        return value - reference;
    }   
    else {
        if (value >= reference.min && value <= reference.max)
            return 0;
        
        if (value < reference.min)
            return value - reference.min;
        
        return value - reference.max;
    }
}

export function getAdjustedLevel(levelInput:number, levelTarget:number, value:number, table:GMTable<number|Range> ): number
{
    const tier = getValueTier(table, levelInput, value);
    const comparison = compare(GetGMTableValue(table, tier, levelInput), value);
    
    const originalTierValue = GetGMTableValue(table, tier, levelInput);
    const targetTierValue = GetGMTableValue(table, tier, levelTarget);
    
    const originalIsNumber = typeof originalTierValue === 'number';
    const targetIsNumber = typeof targetTierValue === 'number';
    
    if (originalIsNumber && targetIsNumber)
    {
        if (comparison === 0)
            return targetTierValue;
        
        if(comparison > 0)
        {
            const prevValue = originalTierValue;
            let nextValue;
            if (tier === "extreme")
                nextValue = getExtremePlusValue(table, levelInput) as number;
            else
                nextValue = GetGMTableValue(table, nextTier(tier), levelInput) as number;
            
            const lerpVal = prevValue===nextValue? 0.5 : inLerp(prevValue, nextValue, value);
            
            
            const targetValuePrev = GetGMTableValue(table, tier, levelTarget) as number;
            let targetValueNext;
            if (tier === "extreme")
                targetValueNext = getExtremePlusValue(table, levelTarget) as number;
            else
                targetValueNext = GetGMTableValue(table, nextTier(tier), levelTarget) as number;
            
            return Math.round(lerp(targetValuePrev, targetValueNext, lerpVal));
        }
        
        if (comparison < 0)
        {
            let prevValue;
            if (tier === "terrible")
                prevValue = getTerriblePlusValue(table, levelInput) as number;
            else
                prevValue = GetGMTableValue(table, previousTier(tier), levelInput) as number;
            const nextValue = originalTierValue;
            
            const lerpVal = prevValue===nextValue?0.5: inLerp(prevValue, nextValue, value);
            
            let targetValuePrev;
            if (tier === "terrible")
                targetValuePrev = getTerriblePlusValue(table, levelTarget) as number;
            else
                targetValuePrev = GetGMTableValue(table, previousTier(tier), levelTarget) as number;
            
            const targetValueNext = GetGMTableValue(table, nextTier(tier), levelTarget) as number;
            
            return Math.round(lerp(targetValuePrev, targetValueNext, lerpVal));
        }
    }
    else if (!originalIsNumber && !targetIsNumber)
    {
        if (comparison === 0)
        {
            const lerpVal = originalTierValue.min === originalTierValue.max ? 0.5 : inLerp(originalTierValue.min, originalTierValue.max, value);
            return Math.round(lerp(targetTierValue.min, targetTierValue.max, lerpVal));
        }
        if (comparison > 0)
        {
            const prevValue = originalTierValue;
            let nextValue;
            if (tier === "extreme")
                nextValue = getExtremePlusValue(table, levelInput) as Range;
            else
                nextValue = GetGMTableValue(table, nextTier(tier), levelInput) as Range;

            const lerpA = prevValue.max??prevValue;
            const lerpB = nextValue.min??nextValue;
            const lerpVal = lerpA === lerpB ? 0.5 : inLerp(lerpA, lerpB, value);

            const targetValuePrev = GetGMTableValue(table, tier, levelTarget) as Range;
            let targetValueNext;
            if (tier === "extreme")
                targetValueNext = getExtremePlusValue(table, levelTarget) as Range;
            else
                targetValueNext = GetGMTableValue(table, nextTier(tier), levelTarget) as Range;

            return Math.round(lerp(targetValuePrev.max??targetValuePrev, targetValueNext.min??targetValueNext, lerpVal));
        }
        if (comparison < 0)
        {
            let prevValue;
            if (tier === "terrible")
                prevValue = getTerriblePlusValue(table, levelInput) as Range;
            else
                prevValue = GetGMTableValue(table, previousTier(tier), levelInput) as Range;
            const nextValue = originalTierValue;

            const lerpA = prevValue.max??prevValue;
            const lerpB = nextValue.min??nextValue;
            
            const lerpVal = lerpA === lerpB ? 0.5 : inLerp(lerpA, lerpB , value);

            let targetValuePrev;
            if (tier === "terrible")
                targetValuePrev = getTerriblePlusValue(table, levelTarget) as Range;
            else
                targetValuePrev = GetGMTableValue(table, previousTier(tier), levelTarget) as Range;

            const targetValueNext = GetGMTableValue(table, nextTier(tier), levelTarget) as Range;

            return Math.round(lerp(targetValuePrev.max??targetValuePrev, targetValueNext.min??targetValueNext, lerpVal));
        }
    }
    return 99;
}

//Remove these
export const moderateStrikeBonusTable: RangeLevelLookupTable<number> = {
    ranges: [
        { min: -Infinity,  max: 0,  value: 6 },
        { min: 1,   max: 1,  value: 7 },
        { min: 2,   max: 2,  value: 9 },
        { min: 3,   max: 3,  value: 10 },
        { min: 4,   max: 4,  value: 12 },
        { min: 5,   max: 5,  value: 13 },
        { min: 6,   max: 6,  value: 15 },
        { min: 7,   max: 7,  value: 16 },
        { min: 8,   max: 8,  value: 18 },
        { min: 9,   max: 9,  value: 19 },
        { min: 10,   max: 10,  value: 21 },
        { min: 11,   max: 11,  value: 22 },
        { min: 12,   max: 12,  value: 24 },
        { min: 13,   max: 13,  value: 25 },
        { min: 14,   max: 14,  value: 27 },
        { min: 15,   max: 15,  value: 28 },
        { min: 16,   max: 16,  value: 30 },
        { min: 17,   max: 17,  value: 31 },
        { min: 18,   max: 18,  value: 33 },
        { min: 19,   max: 19,  value: 34 },
        { min: 20,   max: 20,  value: 36 },
        { min: 21,   max: 21,  value: 37 },
        { min: 22,   max: 22,  value: 39 },
        { min: 23,   max: 23,  value: 40 },
        { min: 24,   max: 24,  value: 42 },
    ],
    lookup(level: number): number {
        const x = this.ranges.find(r => level >= r.min && level <= r.max);
        return x?.value ?? 0;
    }
};
export const moderateStrikeDamageTable: RangeLevelLookupTable<string> = {
    ranges: [
        { min: -Infinity,  max: -1,  value: "1d4" },
        { min: 0,   max: 0,  value: "1d4+2" },
        { min: 1,   max: 1,  value: "1d6+2" },
        { min: 2,   max: 2,  value: "1d8+4" },
        { min: 3,   max: 3,  value: "1d8+6" },
        { min: 4,   max: 4,  value: "2d6+5" },
        { min: 5,   max: 5,  value: "2d6+6" },
        { min: 6,   max: 6,  value: "2d6+8" },
        { min: 7,   max: 7,  value: "2d8+8" },
        { min: 8,   max: 8,  value: "2d8+9" },
        { min: 9,   max: 9,  value: "2d8+11" },
        { min: 10,   max: 10,  value: "2d10+11" },
        { min: 11,   max: 11,  value: "2d10+12" },
        { min: 12,   max: 12,  value: "3d8+12" },
        { min: 13,   max: 13,  value: "3d8+14" },
        { min: 14,   max: 14,  value: "3d8+15" },
        { min: 15,   max: 15,  value: "3d10+14" },
        { min: 16,   max: 16,  value: "3d10+15" },
        { min: 17,   max: 17,  value: "3d10+16" },
        { min: 18,   max: 18,  value: "3d10+17" },
        { min: 19,   max: 19,  value: "4d8+17" },
        { min: 20,   max: 20,  value: "4d8+19" },
        { min: 21,   max: 21,  value: "4d8+20" },
        { min: 22,   max: 22,  value: "4d8+22" },
        { min: 23,   max: 23,  value: "4d10+20" },
        { min: 24,   max: 24,  value: "4d10+22" },
    ],
    lookup(level: number): string {
        const x = this.ranges.find(r => level >= r.min && level <= r.max);
        return x?.value ?? "1d4";
    }
};
export const moderateSpellDcTable: RangeLevelLookupTable<number> = {
    ranges: [
        { min: -Infinity, max: 0,  value: 13 },
        { min: 1,  max: 1,  value: 14 },
        { min: 2,  max: 2,  value: 15 },
        { min: 3,  max: 3,  value: 17 },
        { min: 4,  max: 4,  value: 18 },
        { min: 5,  max: 5,  value: 19 },
        { min: 6,  max: 6,  value: 21 },
        { min: 7,  max: 7,  value: 22 },
        { min: 8,  max: 8,  value: 23 },
        { min: 9,  max: 9,  value: 25 },
        { min: 10, max: 10, value: 26 },
        { min: 11, max: 11, value: 27 },
        { min: 12, max: 12, value: 29 },
        { min: 13, max: 13, value: 30 },
        { min: 14, max: 14, value: 31 },
        { min: 15, max: 15, value: 33 },
        { min: 16, max: 16, value: 34 },
        { min: 17, max: 17, value: 35 },
        { min: 18, max: 18, value: 37 },
        { min: 19, max: 19, value: 38 },
        { min: 20, max: 20, value: 39 },
        { min: 21, max: 21, value: 41 },
        { min: 22, max: 22, value: 42 },
        { min: 23, max: 23, value: 43 },
        { min: 24, max: 24, value: 45 },
    ],
    lookup(level: number): number {
        const x = this.ranges.find(r => level >= r.min && level <= r.max);
        return x?.value ?? 0;
    }
};
export const moderateSpellAttackBonusTable: RangeLevelLookupTable<number> = {
    ranges: [
        { min: -Infinity, max: 0,  value: 5 },
        { min: 1,  max: 1,  value: 6 },
        { min: 2,  max: 2,  value: 7 },
        { min: 3,  max: 3,  value: 9 },
        { min: 4,  max: 4,  value: 10 },
        { min: 5,  max: 5,  value: 11 },
        { min: 6,  max: 6,  value: 13 },
        { min: 7,  max: 7,  value: 14 },
        { min: 8,  max: 8,  value: 15 },
        { min: 9,  max: 9,  value: 17 },
        { min: 10, max: 10, value: 18 },
        { min: 11, max: 11, value: 19 },
        { min: 12, max: 12, value: 21 },
        { min: 13, max: 13, value: 22 },
        { min: 14, max: 14, value: 23 },
        { min: 15, max: 15, value: 25 },
        { min: 16, max: 16, value: 26 },
        { min: 17, max: 17, value: 27 },
        { min: 18, max: 18, value: 29 },
        { min: 19, max: 19, value: 30 },
        { min: 20, max: 20, value: 31 },
        { min: 21, max: 21, value: 33 },
        { min: 22, max: 22, value: 34 },
        { min: 23, max: 23, value: 35 },
        { min: 24, max: 24, value: 37 },
    ],
    lookup(level: number): number {
        const x = this.ranges.find(r => level >= r.min && level <= r.max);
        return x?.value ?? 0;
    }
};

