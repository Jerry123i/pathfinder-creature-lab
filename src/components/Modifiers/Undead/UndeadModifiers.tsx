import {AddDarkVision, cloneStatBlock, type StatBlockProp} from "../../StatBlock.tsx";
import {addImmunities, addLanguages, addResistances, addWeakness, type CreatureAdjustment} from "../Modifiers.tsx";
import {AddTrait, ReplaceTrait} from "../../Traits.tsx";
import type {LookupTable} from "../../LookupTable.tsx";

const voidHealing = JSON.parse("{\"_id\":\"q1OobVjFqRsc58KI\",\"_stats\":{\"compendiumSource\":\"Compendium.pf2e.bestiary-ability-glossary-srd.Item.TTCw5NusiSSkJU1x\"},\"img\":\"systems/pf2e/icons/actions/Passive.webp\",\"name\":\"Void Healing\",\"sort\":400000,\"system\":{\"actionType\":{\"value\":\"passive\"},\"actions\":{\"value\":null},\"category\":\"defensive\",\"description\":{\"value\":\"<p>@Localize[PF2E.NPC.Abilities.Glossary.NegativeHealing]</p>\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"Pathfinder Monster Core\"},\"rules\":[{\"key\":\"ActiveEffectLike\",\"mode\":\"override\",\"path\":\"system.attributes.hp.negativeHealing\",\"value\":true}],\"slug\":\"void-healing\",\"traits\":{\"rarity\":\"common\",\"value\":[]}},\"type\":\"action\"}");

export const Undead : CreatureAdjustment = 
{
    _id:"adj_undead",
    name: "Undead",
    description: "",
    priority: 1,
    type: "Undead",
    apply: (statblock: StatBlockProp) =>
    {
        const sb = cloneStatBlock(statblock);

        sb.name = "Undead " + sb.name;
        ReplaceTrait(sb, "humanoid", "undead");
        addLanguages(sb, "necril", false)

        addImmunities(sb, ["death","disease","paralyzed","poison","unconscious"])
        
        return sb;
    }
}

export const MindlessUndead : CreatureAdjustment =
    {
        _id:"adj_mindlessundead",
        name: "Mindless Undead",
        description: "",
        priority: 1,
        type: "Undead",
        apply: (statblock: StatBlockProp) =>
        {
            const sb = cloneStatBlock(statblock);

            sb.name = "Undead " + sb.name;
            ReplaceTrait(sb, "humanoid", "undead");
            AddTrait(sb, "mindless");

            addImmunities(sb, ["death","disease","paralyzed","poison","unconscious"])
            
            return sb;
        }
    }

export const Zombie: CreatureAdjustment = {
    _id: "adj_zombie",
    name: "Zombie",
    description: "A zombified creature is a mindless, rotting corpse that attacks everything it perceives.",
    priority: 1,
    type: "Undead",
    apply: (statblock: StatBlockProp) => {
        const sb = cloneStatBlock(statblock);

        sb.name = "Zombie " + sb.name;

        ReplaceTrait(sb, "humanoid", "undead");
        AddTrait(sb, "mindless");
        AddTrait(sb, "zombie");

        const hpTable: LookupTable<number> = {
            ranges: [
                { min: -Infinity,  max: 1,  value: 10 },
                { min: 2,   max: 5,  value: 20 },
                { min: 6,   max: 10,  value: 50 },
                { min: 11,   max: 15,  value: 75 },
                { min: 16,   max: 19,  value: 100 },
                { min: 20,   max: Infinity,  value: 150 }
            ],

            lookup(level: number): number {
                const x = this.ranges.find(r => level >= r.min && level <= r.max);
                return x?.value ?? 0;
            }
        };

        const weaknessTable: LookupTable<number> = {
            ranges: [
                { min: -Infinity,  max: 1,  value: 5 },
                { min: 2,   max: 5,  value: 5 },
                { min: 6,   max: 10,  value: 10 },
                { min: 11,   max: 15,  value: 15 },
                { min: 16,   max: 19,  value: 20 },
                { min: 20,   max: Infinity,  value: 25 }
            ],

            lookup(level: number): number {
                const x = this.ranges.find(r => level >= r.min && level <= r.max);
                return x?.value ?? 0;
            }
        };
        
        const weaknessValue = weaknessTable.lookup(sb.system.details.level.value);
        
        addWeakness(sb, {type:"slashing", value: weaknessValue});
        addWeakness(sb, {type:"vitality", value: weaknessValue});
        
        sb.system.attributes.hp.value += hpTable.lookup(sb.system.details.level.value);

        addImmunities(sb, ["death","disease","paralyzed","poison","unconscious"])
        
        AddDarkVision(sb, "darkvision");
        
        const slowAbility = JSON.parse("{\"_id\":\"eulyI60JHNUYs39w\",\"img\":\"systems/pf2e/icons/actions/Passive.webp\",\"name\":\"Slow\",\"sort\":300000,\"system\":{\"actionType\":{\"value\":\"passive\"},\"actions\":{\"value\":null},\"category\":\"interaction\",\"description\":{\"value\":\"<p>A zombie is permanently @UUID[Compendium.pf2e.conditionitems.Item.Slowed]{Slowed 1} and can't use reactions.</p>\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"\"},\"rules\":[{\"inMemoryOnly\":true,\"key\":\"GrantItem\",\"uuid\":\"Compendium.pf2e.conditionitems.Item.Slowed\"}],\"slug\":null,\"traits\":{\"rarity\":\"common\",\"value\":[]}},\"type\":\"action\"}");
        sb.items.push(slowAbility);
        sb.items.push(voidHealing);

        return sb;
    }
}

export const Skeleton: CreatureAdjustment = {
    _id: "adj_skeleton",
    name: "Skeleton",
    description: "",
    priority: 1,
    type: "Undead",
    apply: (statblock: StatBlockProp) => {
        const sb = cloneStatBlock(statblock);

        sb.name = "Skeleton " + sb.name;

        ReplaceTrait(sb, "humanoid", "undead");
        AddTrait(sb, "skeleton");
        addLanguages(sb,  "necril");
        

        const hpTable: LookupTable<number> = {
            ranges: [
                { min: -Infinity,  max: -1,  value: -2 },
                { min: 0,   max: 1,  value: -4 },
                { min: 2,   max: 5,  value: -10 },
                { min: 6,   max: 10,  value: -20 },
                { min: 11,   max: Infinity,  value: -40 }
            ],

            lookup(level: number): number {
                const x = this.ranges.find(r => level >= r.min && level <= r.max);
                return x?.value ?? 0;
            }
        };

        const weaknessTable: LookupTable<number> = {
            ranges: [
                { min: -Infinity,  max: -1,  value: 2 },
                { min: 0,   max: 1,  value: 2 },
                { min: 2,   max: 5,  value: 3 },
                { min: 6,   max: 10,  value: 5 },
                { min: 11,   max: Infinity,  value: 10 }
            ],

            lookup(level: number): number {
                const x = this.ranges.find(r => level >= r.min && level <= r.max);
                return x?.value ?? 0;
            }
        };

        sb.system.attributes.hp.value += hpTable.lookup(sb.system.details.level.value);
        
        const weaknessValue = weaknessTable.lookup(sb.system.details.level.value);

        addResistances(sb, ["cold", "electricity", "fire", "piercing", "slashing"], weaknessValue);

        addImmunities(sb, ["death","disease","paralyzed","poison","unconscious"])

        AddDarkVision(sb, "darkvision");

        sb.items.push(voidHealing);
        
        return sb;
    }
}

export const Vampire: CreatureAdjustment = {
    _id: "adj_vampire",
    name: "Vampire",
    description: "",
    priority: 1,
    type: "Undead",
    apply: (statblock: StatBlockProp) => {
        const sb = cloneStatBlock(statblock);

        sb.name = "Vampire " + sb.name;

        return sb;
    }
}