
type AttributeTiers = "extreme" | "high" | "moderate" | "low" | "terrible";

export interface ValueRange{
    min : number;
    max?: number;
}

export interface LevelLookupTable<T>{
    values : T[][];
}

function GetValue<T>(table : LevelLookupTable<T>, level : number, tier : AttributeTiers) : T
{
    //return table[level][Number(tier)];
    return (table.values[level][Number(tier)]);
}

export const AttributeModifierScalesTable : LevelLookupTable<number> = 
{
    values : [
        [0, 3, 2, 0],
        [0, 3, 2, 0],
        [5, 4, 3, 1],
        [5, 4, 3, 1],
        [5, 4, 3, 1],
        [6, 5, 3, 2],
        [6, 5, 4, 2],
        [7, 5, 4, 2],
        [7, 6, 4, 2],
        [7, 6, 4, 3],
        [7, 6, 4, 3],
        [8, 7, 5, 3],
        [8, 7, 5, 3],
        [8, 7, 5, 4],
        [9, 8, 5, 4],
        [9, 8, 5, 4],
        [9, 8, 6, 4],
        [10, 9, 6, 5],
        [10, 9, 6, 5],
        [10, 9, 6, 5],
        [11, 10, 6, 5],
        [11, 10, 7, 6],
        [11, 10, 7, 6],
        [12, 10, 8, 6],
        [12, 10, 8, 6],
        [13, 12, 9, 7]
    ]
}

export const PerceptionModifierTable : LevelLookupTable<number> =
{
    values:[
    [9, 8, 5, 2, 0],
    [10, 9, 6, 3, 1],
    [11, 10, 7, 4, 2],
    [12, 11, 8, 5, 3],
    [14, 12, 9, 6, 4],
    [15, 14, 11, 8, 6],
    [17, 15, 12, 9, 7],
    [18, 17, 14, 11, 8],
    [20, 18, 15, 12, 10],
    [21, 19, 16, 13, 11],
    [23, 21, 18, 15, 12],
    [24, 22, 19, 16, 14],
    [26, 24, 21, 18, 15],
    [27, 25, 22, 19, 16],
    [29, 26, 23, 20, 18],
    [30, 28, 25, 22, 19],
    [32, 29, 26, 23, 20],
    [33, 30, 28, 25, 22],
    [35, 32, 29, 26, 23],
    [36, 33, 30, 27, 24],
    [38, 35, 32, 29, 26],
    [39, 36, 33, 30, 27],
    [41, 38, 35, 32, 28],
    [43, 39, 36, 33, 30],
    [44, 40, 37, 34, 31],
    [46, 42, 38, 36, 32]]
}

export const HPTable : LevelLookupTable<ValueRange> =
{
   
}
