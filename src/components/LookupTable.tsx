
//type AttributeTiers = "extreme" | "high" | "moderate" | "low" | "terrible";

interface Range {
    min: number;
    max: number; // use Infinity for open-ended ranges
    value: string;
}

export interface LookupTable {
    ranges: Range[];
    lookup(level: number): string;
}