import type {LookupTable} from "../components/LookupTable.tsx";

export const moderateStrikeBonusTable: LookupTable<number> = {
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

export const moderateStrikeDamageTable: LookupTable<string> = {
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