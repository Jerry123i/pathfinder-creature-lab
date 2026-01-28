import type {CreatureItem, ItemSystem, StatsJson} from "./StatBlock.tsx";
import {ShieldCheckeredIcon, ShieldIcon, ShieldPlusIcon} from "@phosphor-icons/react";

interface ShieldItem extends CreatureItem
{
    system : ShieldSystem;
}

interface ShieldSystem extends ItemSystem
{
    acBonus : number;
    hardness: number;
    hp: {max:number , value:number};
    
}

export function GetShield(creatureStatBlock : StatsJson) : ShieldSystem | undefined
{
    const value = creatureStatBlock.items.filter(v => {return v.type === "shield"});
    
    if (value.length === 0)
        return undefined;
    
    const shield = value[0] as ShieldItem;
    
    return shield.system;
}

export function PrintShield(value: StatsJson) {
    const shield = GetShield(value);
    const shieldBlock = hasShieldBlock(value);

    return (
        <>
            {shield && (
                <>
                    <ShieldIcon weight="bold" className="-ml-1 align-middle" />
                    <span className="text-xs -ml-1 align-middle">AC</span>
                    {value.system.attributes.ac.value + (shield.acBonus ?? 0)}

                    <ShieldPlusIcon weight="bold" className="align-middle" />
                    <span className="text-xs -ml-1 align-middle">HP</span>
                    {shield.hp?.value ?? 0}

                    <ShieldCheckeredIcon weight="bold" className="align-middle" />
                    <span className="text-xs -ml-1 align-middle">Hrd</span>
                    {shield.hardness ?? 0}
                </>
            )}
            <span className="text-xs flex items-center gap-1">
                {shieldBlock && (
                    <span className="text-xs">
                        <span className="pathfinder-action text-[1.25rem] leading-none">R</span>
                        <span className="font-semibold">Shield Block</span>
                    </span>
                )}
            </span>
        </>
    );
}

function hasShieldBlock(value :StatsJson) : boolean
{
    const shieldBlock = value.items.filter(v => v.system.slug === "shield-block"); 
    return shieldBlock.length > 0;
}