import {inLerp, lerp, remap} from "./LinearInterpolation.tsx";

export type AttributeTiers = "extreme" | "high" | "moderate" | "low" | "terrible";
type TableType = "number" | "range";

export function nextTier(value : AttributeTiers) : AttributeTiers
{
    switch (value) {
        case "extreme":
            return "extreme";
        case "high":
            return "extreme";
        case "moderate":
            return "high";
        case "low":
            return "moderate";
        case "terrible":
            return "low";
    }
}

export function previousTier(value : AttributeTiers) : AttributeTiers
{
    switch (value) {
        case "extreme":
            return "high";
        case "high":
            return "moderate";
        case "moderate":
            return "low";
        case "low":
            return "terrible";
        case "terrible":
            return "terrible";
    }
}


interface RangeTableLine<T> {
    min: number;
    max: number;
    value: T;
}

export interface GMTable<T> {
    extreme: T[];
    high: T[];
    moderate: T[];
    low: T[];
    terrible: T[];
    type : TableType;
}

export function GetGMTableValue<T>(table: GMTable<T>, tier: AttributeTiers, level : number):T{
    if (level < -1)
        level = -1;
    if (level > 24)
        level = 24;
    
    return table[tier][level+1];
}

export interface RangeLevelLookupTable<T> {
    ranges: RangeTableLine<T>[];
    lookup(level: number): T;
}

export interface Range{
    min: number;
    max: number;
}

export function GetValue(r: Range,t: number): number
{
    return lerp(r.min,r.max, t);    
}

export function GetLerpValue(r: Range,t: number): number
{
    return inLerp(r.min, r.max, t);    
}

export function RemapRange( rFrom: Range, rTo: Range, t:number): number
{
    return remap(t, rFrom.min, rFrom.max, rTo.min, rTo.max);    
}