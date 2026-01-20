import {inLerp, lerp, remap} from "./LinearInterpolation.tsx";

export type AttributeTiers = "extreme" | "high" | "moderate" | "low" | "terrible";

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
}

export function LookupTable<T>(table: GMTable<T>, tier: AttributeTiers, level:number) : T
{
    let l = level+1;
    if (l<0)
        l =0;
    if (l > 25)
        l = 25;
    return table[tier][l];    
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