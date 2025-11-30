
//type AttributeTiers = "extreme" | "high" | "moderate" | "low" | "terrible";

interface Range<T> {
    min: number;
    max: number; // use Infinity for open-ended ranges
    value: T;
}

export interface LookupTable<T> {
    ranges: Range<T>[];
    lookup(level: number): T;
}