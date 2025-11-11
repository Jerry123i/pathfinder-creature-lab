import {
    type CreatureItemStrike,
    type DamageRollInfo,
    DiceString,
    GetDice,
    type ItemSystem,
    type StatBlockProp,
    type StringHolder,
    type ValueHolder,
    printNumberWithSignalElement, type CreatureItem
} from "./StatBlock.tsx";
import {type CreatureItemSpell, GetSpells, type SpellcastingItem} from "./Spells.tsx";

export interface StrikeSystem extends ItemSystem {
    bonus: ValueHolder,
    weaponType?: StringHolder,
    range: { increment: number, max: number },
    traits: { rarity?: string, value: string[] }
    damageRolls: Record<string, DamageRollInfo>
}

export interface CreatureItemStrike extends CreatureItem {
    system: StrikeSystem
}

export function modifyAllStrikes(creature: StatBlockProp, hitValue: number, damageValue: number) {
    const strikes = GetStrikes(creature);

    for (let i = 0, len = strikes.length; i < len; ++i) {
        strikes[i].system.bonus.value += hitValue;
        const rawDamage = GetDamagesInfo(strikes[i].system);

        for (let j = 0, lenj = rawDamage.length; j < lenj; ++j) {
            if (j > 0)
                break;
            const damage = GetDice(rawDamage[j]);
            damage.modifier += damageValue;

            rawDamage[j].damage = DiceString(damage);
        }
    }
}

export function GetStrikes(value: StatBlockProp): CreatureItemStrike[] {

    return value.items.filter(item => item.type === "melee") as CreatureItemStrike[];
}

function GetDamagesInfo(value: StrikeSystem): DamageRollInfo[] {
    const roll = value.damageRolls!;
    const keys = Object.keys(roll);

    const damages: DamageRollInfo[] = [];

    for (const key of keys) {
        const damageRoll = roll[key] as DamageRollInfo;
        damages.push(damageRoll);
    }

    return damages;
}

export function PrintStrike(item: CreatureItemStrike) {
    if (item.system.weaponType === undefined) {
        item.system.weaponType = {value: "melee"};

        if (item.system.range !== undefined) {
            if (item.system.range?.increment > 0)
                item.system.weaponType = {value: "ranged"};
        }

    }

    let map: number;
    map = 5;

    if (item.system.traits.value.includes("agile"))
        map = 4;

    return (<>
        <b>{item.system.weaponType.value}</b> {item.name} {printNumberWithSignalElement(item.system.bonus.value)} [{printNumberWithSignalElement(item.system.bonus.value - map)}/{printNumberWithSignalElement(item.system.bonus.value - (map * 2))}]
        {GetDamagesInfo(item.system).map(dmg => (<> {dmg.damage} {dmg.damageType}</>))}
    </>)
}