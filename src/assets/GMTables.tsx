import type {GMTable, RangeLevelLookupTable, Range, AttributeTiers} from "../components/LookupTable.tsx";

export const attributeModifierScales : GMTable<number> =
{
    extreme:    [ 4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 9,10,10,10,11,11,11,12,12,13],
    high:       [ 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9,10,10,10,10,10,12],
    moderate:   [ 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 8, 8, 9],
    low:        [ 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7],
    terrible:   [ 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7],
}

export const perceptionScales : GMTable<number> =
{
    extreme:    [ 9,10,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,43,44,46],
    high:       [ 8, 9,10,11,12,14,15,17,18,19,21,22,24,25,26,28,29,30,32,33,35,36,38,39,40,42],
    moderate:   [ 5, 6, 7, 8, 9,11,12,14,15,16,18,19,21,22,23,25,26,28,29,30,32,33,35,36,37,38],
    low:        [ 2, 3, 4, 5, 6, 8, 9,11,12,13,15,16,18,19,20,22,23,25,26,27,29,30,32,33,34,36],
    terrible:   [ 0, 1, 2, 3, 4, 6, 7, 8,10,11,12,14,15,16,18,19,20,22,23,24,26,27,28,30,31,32]
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
    terrible:   Array(26).fill(0)
}
 
export const armorClassScales : GMTable<number> = 
{
    extreme:  [18,19,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45,46,48,49,51,52,54],
    high:     [15,16,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45,46,48,49,51],
    moderate: [14,15,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,42,44,45,47,48,50],
    low:      [12,13,13,15,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45,46,48],
    terrible: Array.from({ length: 26 }, () => 1)
}

export const savingThrowScales: GMTable<number> = {
    extreme:  [ 9,10,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,43,44,46 ],
    high:     [ 8, 9,10,11,12,14,15,17,18,19,21,22,24,25,26,28,29,30,32,33,35,36,38,39,40,42 ],
    moderate: [ 5, 6, 7, 8, 9,11,12,14,15,16,18,19,21,22,23,25,26,28,29,30,32,33,35,36,37,38 ],
    low:      [ 2, 3, 4, 5, 6, 8, 9,11,12,13,15,16,18,19,20,22,23,25,26,27,29,30,32,33,34,36 ],
    terrible: [ 0, 1, 2, 3, 4, 6, 7, 8,10,11,12,14,15,16,18,19,20,22,23,24,26,27,28,30,31,32 ],
};

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
};

export const strikeAttackBonusScales: GMTable<number> = {
    extreme:  [10,10,11,13,14,16,17,19,20,22,23,25,27,28,29,31,32,34,35,37,38,40,41,43,44,46],
    high:     [ 8, 8, 9,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,42,44],
    moderate: [ 6, 6, 7, 9,10,12,13,15,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42],
    low:      [ 4, 4, 5, 7, 8, 9,11,12,13,15,16,17,19,20,21,23,24,25,27,28,29,31,32,33,35,36],
    terrible: Array.from({ length: 26 }, () => 1),
};

export const strikeDamageScales: GMTable<number> = {
    extreme:  [ 4, 6, 8,11,15,18,20,23,25,28,30,33,35,38,40,43,45,48,50,53,55,58,60,63,65,68 ],
    high:     [ 3, 5, 6, 9,12,14,16,18,20,22,24,26,28,30,32,34,36,37,38,40,42,44,46,48,50,52 ],
    moderate: [ 3, 4, 5, 8,10,12,13,15,17,18,20,22,23,25,27,28,30,31,32,33,35,37,38,40,42,44 ],
    low:      [ 2, 3, 4, 6, 8, 9,11,12,13,15,16,17,19,20,21,23,24,25,26,27,28,29,31,32,33,35 ],
    terrible: Array.from({ length: 26 }, () => 1)
};

export const spellDcScales: GMTable<number> = {
    low: Array.from({ length: 26 }, () => 1),
    terrible: Array.from({ length: 26 }, () => 1),
    extreme:  [19,19,20,22,23,25,26,27,29,30,32,33,34,36,37,39,40,41,43,44,46,47,48,50,51,52],
    high:     [16,16,17,18,20,21,22,24,25,26,28,29,30,32,33,34,36,37,38,40,41,42,44,45,46,48],
    moderate: [13,13,14,15,17,18,19,21,22,23,25,26,27,29,30,31,33,34,35,37,38,39,41,42,43,45]
};

export const spellAttackScales: GMTable<number> = {
    low: Array.from({ length: 26 }, () => 1),
    terrible: Array.from({ length: 26 }, () => 1),
    extreme:  [11,11,12,14,15,17,18,19,21,22,24,25,26,28,29,31,32,33,35,36,38,39,40,42,43,44],
    high:     [ 8, 8, 9,10,12,13,14,16,17,18,20,21,22,24,25,26,28,29,30,32,33,34,36,37,38,40],
    moderate: [ 5, 5, 6, 7, 9,10,11,13,14,15,17,18,19,21,22,23,25,26,27,29,30,31,33,34,35,37]
};

export function getValueTier(table:GMTable<number|Range>, level : number, value:number): AttributeTiers
{
    level = level+1;
    const terribleRef = table.terrible[level];
    const lowRef = table.low[level];
    const moderateRef = table.moderate[level];
    const extremeRef = table.extreme[level];
    const highRef = table.high[level];

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

