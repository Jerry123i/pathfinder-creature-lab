import type {GMTable, Range} from "./LookupTable.tsx";
import {
    armorClassScales, attributeModifierScales,
    getValueTier, hitPointScales,
    perceptionScales,
    savingThrowScales,
    skillsScales, strikeAttackBonusScales, strikeDamageScales
} from "../assets/GMTables.tsx";
import {type CreatureItemStrike, getDamageAverage} from "./Strikes.tsx";


function PrintMarker(table : GMTable<number|Range>, level: number, value : number) 
{
    switch (getValueTier(table, level, value)) {
        case "extreme":
            return <span className="text-fuchsia-600 font-mono font-extrabold"><sup>E</sup></span>
        case "high":
            return <span className="text-red-500 font-mono font-extrabold"><sup>H</sup></span>
        case "moderate":
            return <span className="text-green-700 font-mono font-extrabold"><sup>M</sup></span>
        case "low":
            return <span className="text-yellow-600 font-mono font-extrabold"><sup>L</sup></span>
        case "terrible":
            return <span className="text-stone-600 font-mono font-extrabold"><sup>T</sup></span>

    }
}

export function PrintPerceptionTier(level : number, value : number)
{
    return PrintMarker(perceptionScales, level,  value);    
}

export function PrintSkillTier(level : number, value : number){
    return PrintMarker(skillsScales, level, value);
}

export function PrintACTier(level : number, value : number){
    return PrintMarker(armorClassScales, level, value);
}

export function PrintSavesTier(level : number, value : number){
    return PrintMarker(savingThrowScales, level, value);
}

export function PrintHPTier(level : number, value : number){
    return PrintMarker(hitPointScales, level, value);
}

export function PrintAttributeTier(level : number, value : number){
    return PrintMarker(attributeModifierScales, level, value);
}

export function PrintStrikeTier(level : number, value : number){
    return PrintMarker(strikeAttackBonusScales, level, value);
}

export function PrintDamageTier(level : number, value : CreatureItemStrike){
    return PrintMarker(strikeDamageScales, level,  getDamageAverage(value))
}