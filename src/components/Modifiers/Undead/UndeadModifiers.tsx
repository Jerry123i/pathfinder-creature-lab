import {
    AddDarkVision,
    cloneStatBlock,
    type CreatureItem, GetDarknessVision,
    modifyAllSaves,
    type StatBlockProp
} from "../../StatBlock.tsx";
import {
    addImmunities,
    addImmunity,
    addLanguages,
    addResistances,
    addWeakness, addWeaknesses,
    type CreatureAdjustment, modifyAbilitiesDcs
} from "../Modifiers.tsx";
import {AddTrait, ReplaceTrait} from "../../Traits.tsx";
import type {LookupTable} from "../../LookupTable.tsx";
import {type CreatureItemStrike, GetDamagesInfo, GetStrikes, getStrongerStrike} from "../../Strikes.tsx";
import {moderateStrikeBonusTable, moderateStrikeDamageTable} from "../../../assets/GMTables.tsx";

const voidHealing = JSON.parse("{\"_id\":\"q1OobVjFqRsc58KI\",\"_stats\":{\"compendiumSource\":\"Compendium.pf2e.bestiary-ability-glossary-srd.Item.TTCw5NusiSSkJU1x\"},\"img\":\"systems/pf2e/icons/actions/Passive.webp\",\"name\":\"Void Healing\",\"sort\":400000,\"system\":{\"actionType\":{\"value\":\"passive\"},\"actions\":{\"value\":null},\"category\":\"defensive\",\"description\":{\"value\":\"<p>@Localize[PF2E.NPC.Abilities.Glossary.NegativeHealing]</p>\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"Pathfinder Monster Core\"},\"rules\":[{\"key\":\"ActiveEffectLike\",\"mode\":\"override\",\"path\":\"system.attributes.hp.negativeHealing\",\"value\":true}],\"slug\":\"void-healing\",\"traits\":{\"rarity\":\"common\",\"value\":[]}},\"type\":\"action\"}");

const undeadWeaknessTable: LookupTable<number> = {
    ranges: [
        { min: -Infinity,  max: 3,  value: 3 },
        { min: 4,   max: 8,  value: 5 },
        { min: 9,   max: 13,  value: 10 },
        { min: 14,   max: Infinity,  value: 15 }
    ],

    lookup(level: number): number {
        const x = this.ranges.find(r => level >= r.min && level <= r.max);
        return x?.value ?? 0;
    }
};

function applyBaseUndead(statblock: StatBlockProp): StatBlockProp {
    const sb = cloneStatBlock(statblock);

    ReplaceTrait(sb, "humanoid", "undead");
    AddDarkVision(sb, "darkvision");

    addImmunities(sb, ["death", "disease", "paralyzed", "poison", "unconscious"]);

    sb.items.push(voidHealing);

    return sb;
}

export const Zombie: CreatureAdjustment = {
    _id: "adj_zombie",
    name: "Zombie",
    description: "A zombified creature is a mindless, rotting corpse that attacks everything it perceives.",
    priority: 1,
    type: "Undead",
    apply: (statblock: StatBlockProp) => 
    {
        let sb = cloneStatBlock(statblock);
        sb = applyBaseUndead(sb);
        

        sb.name = "Zombie " + sb.name;

        // Zombie-specific traits and abilities
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

        const slowAbility = JSON.parse("{\"_id\":\"eulyI60JHNUYs39w\",\"img\":\"systems/pf2e/icons/actions/Passive.webp\",\"name\":\"Slow\",\"sort\":300000,\"system\":{\"actionType\":{\"value\":\"passive\"},\"actions\":{\"value\":null},\"category\":\"interaction\",\"description\":{\"value\":\"<p>A zombie is permanently @UUID[Compendium.pf2e.conditionitems.Item.Slowed]{Slowed 1} and can't use reactions.</p>\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"\"},\"rules\":[{\"inMemoryOnly\":true,\"key\":\"GrantItem\",\"uuid\":\"Compendium.pf2e.conditionitems.Item.Slowed\"}],\"slug\":null,\"traits\":{\"rarity\":\"common\",\"value\":[]}},\"type\":\"action\"}");
        sb.items.push(slowAbility);

        return sb;
    }
}

export const Skeleton: CreatureAdjustment = {
    _id: "adj_skeleton",
    name: "Skeleton",
    description: "A skeleton is an animated pile of bones, typically under the command of a more powerful undead.",
    priority: 1,
    type: "Undead",
    apply: (statblock: StatBlockProp) => {
        let sb = cloneStatBlock(statblock);
        sb = applyBaseUndead(sb);

        sb.name = "Skeleton " + sb.name;

        AddTrait(sb, "skeleton");
        addLanguages(sb,  "necril", true);

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

        return sb;
    }
}

export const Ghost: CreatureAdjustment = {
    _id: "adj_ghost",
    name: "Ghost",
    description: "The ephemeral form of a ghostly creature lets it pass through solid objects and float in the air. For simplicity, a creature with these adjustments isn't truly incorporeal, nor does it necessarily return after being destroyed.",
    priority: 1,
    type: "Undead",
    apply: (statblock: StatBlockProp) => {
        let sb = cloneStatBlock(statblock);
        sb = applyBaseUndead(sb);
        AddTrait(sb, "spirit");
        AddTrait(sb, "ghost");

        addLanguages(sb,  "necril", true);
        
        sb.name = "Ghost " + sb.name;
        
        addImmunity(sb,  "precision");
        
        const weaknessValue = undeadWeaknessTable.lookup(sb.system.details.level.value);
        addWeaknesses(sb, ["force","ghost-touch","vitality"], weaknessValue);
        
        //Can fly
        if (!sb.system.attributes.speed.otherSpeeds.some((v)=>{return v.type === "fly"}))
        {
            if (sb.system.attributes.speed.otherSpeeds === undefined)
                sb.system.attributes.speed.otherSpeeds = [];

            let maxSpeed = sb.system.attributes.speed.value;

            for (const otherSpeed of sb.system.attributes.speed.otherSpeeds) {
                maxSpeed = Math.max(maxSpeed, otherSpeed.value)
            }
            
            sb.system.attributes.speed.otherSpeeds.push({type:"fly", value:maxSpeed});
        }

        sb.system.attributes.speed.otherSpeeds = sb.system.attributes.speed.otherSpeeds.filter((v)=>{return v.type === "fly"});
        sb.system.attributes.speed.value = 0;
        
        const ghostlyPassage = JSON.parse("{\"_id\":\"\",\"_stats\":{\"compendiumSource\":\"Compendium.pf2e.bestiary-ability-glossary-srd.Item.TTCw5NusiSSkJU1x\"},\"img\":\"\",\"name\":\"Ghostly Passage\",\"sort\":400000,\"system\":{\"actionType\":{\"value\":\"action\"},\"actions\":{\"value\":1},\"category\":\"defensive\",\"description\":{\"value\":\"The creature Flies and, during this movement, can pass through walls, creatures, and other material obstacles as though incorporeal. It must begin and end its movement outside of any physical obstacles, and passing through solid material is difficult terrain.\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"Pathfinder Monster Core\"},\"rules\":[{\"key\":\"ActiveEffectLike\",\"mode\":\"override\",\"path\":\"system.attributes.hp.negativeHealing\",\"value\":true}],\"slug\":null,\"traits\":{\"rarity\":\"common\",\"value\":[]}},\"type\":\"action\"}");
        
        sb.items.push(ghostlyPassage);
        
        return sb;
    }
}

export const Ghoul: CreatureAdjustment = {
    _id: "adj_ghoul",
    name: "Ghoul",
    description: "Ghoul creatures are typically hairless and gaunt with blue or purple skin and pointed ears.",
    priority: 1,
    type: "Undead",
    apply: (statblock: StatBlockProp) => {
        let sb = cloneStatBlock(statblock);
        sb = applyBaseUndead(sb);
        AddTrait(sb, "ghoul");

        sb.name = "Ghoul " + sb.name;

        modifyAllSaves(sb.system, -1);
        
        let paralysisStrike : CreatureItemStrike | undefined;

        const paralysisEffect : CreatureItem = JSON.parse("{\"_id\":\"\",\"img\":\"\",\"name\":\"Paralysis\",\"sort\":300000,\"system\":{\"actionType\":{\"value\":\"passive\"},\"actions\":{\"value\":null},\"category\":\"offensive\",\"description\":{\"value\":\"When the creature gets a critical hit with its jaws against a living, non-elf foe of the creature’s level or lower, the foe is paralyzed until the end of the foe’s next turn.\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"\"},\"rules\":[],\"slug\":\"ghoul-paralysis\",\"traits\":{\"rarity\":\"common\",\"value\":[\"occult\",\"necromancy\"]}},\"type\":\"action\"}");
        const swiftLeap : CreatureItem = JSON.parse("{\"_id\":\"\",\"_stats\":{\"compendiumSource\":\"\"},\"img\":\"\",\"name\":\"Swift Leap\",\"sort\":400000,\"system\":{\"actionType\":{\"value\":\"action\"},\"actions\":{\"value\":1},\"category\":\"defensive\",\"description\":{\"value\":\"The creature jumps up to half its Speed. This movement doesn't trigger reactions.\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"Pathfinder Monster Core\"},\"rules\":[{\"key\":\"ActiveEffectLike\",\"mode\":\"override\",\"path\":\"system.attributes.hp.negativeHealing\",\"value\":true}],\"slug\":null,\"traits\":{\"rarity\":\"common\",\"value\":[\"move\"]}},\"type\":\"action\"}");
        
        for (const strike of GetStrikes(sb).baseStrikes)
        {
            if (strike.name.toLowerCase() === "jaws" || strike.name.toLowerCase() === "fangs" || strike.name.toLowerCase() === "tusks" || strike.name.toLowerCase() === "beak")
                paralysisStrike = strike;
        }
        
        if (paralysisStrike === undefined)
        {
            let strikeJson = "{\"_id\":\"\",\"img\":\"systems/pf2e/icons/default-icons/melee.svg\",\"name\":\"Fangs\",\"sort\":100000,\"system\":{\"attack\":{\"value\":\"\"},\"attackEffects\":{\"custom\":\"\",\"value\":[]},\"bonus\":{\"value\":0},\"damageRolls\":{\"0\":{\"damage\":\"X\",\"damageType\":\"piercing\"}},\"description\":{\"value\":\"\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"\"},\"range\":null,\"rules\":[],\"slug\":null,\"traits\":{\"rarity\":\"common\",\"value\":[\"agile\",\"finesse\"]}},\"type\":\"melee\"}";
            const strongestStrike = getStrongerStrike(sb);
            
            let damageDice : string;
            let bonus : number;
            
            if (strongestStrike === undefined)
            {
                bonus = moderateStrikeBonusTable.lookup(sb.system.details.level.value);
                damageDice = moderateStrikeDamageTable.lookup(sb.system.details.level.value);
            }
            else
            {
                bonus = strongestStrike.system.bonus.value;
                damageDice = GetDamagesInfo(strongestStrike.system)[0].damage;
            }
            
            strikeJson = strikeJson.replace(`"damage":"X"`, `"damage":"${damageDice}"`);
            
            const newStrike : CreatureItemStrike = JSON.parse(strikeJson);
            
            if(newStrike.system.attackEffects !== undefined)
                newStrike.system.attackEffects.value = [paralysisEffect.system.slug];
            
            newStrike.system.bonus.value = bonus;
            
            sb.items.push(newStrike);
        }
        else
        {
            if (paralysisStrike.system.attackEffects === undefined)
                paralysisStrike.system.attackEffects = {custom:"", value:[]};

            paralysisStrike.system.attackEffects.value.push(paralysisEffect.system.slug)
        }

        sb.items.push(paralysisEffect);
        sb.items.push(swiftLeap);

        return sb;
    }
}

export const Mummy: CreatureAdjustment = {
    _id: "adj_mummy",
    name: "Mummy",
    description: "All types of creatures can have their corpses preserved and rise as mummies.",
    priority: 1,
    type: "Undead",
    apply: (statblock: StatBlockProp) => {
        let sb = cloneStatBlock(statblock);
        sb = applyBaseUndead(sb);
        AddTrait(sb, "mummy");
        addLanguages(sb,  "necril", true);

        sb.name = "Mummy " + sb.name;
        
        const mummyAura = JSON.parse("{\"_id\":\"\",\"img\":\"systems/pf2e/icons/actions/Passive.webp\",\"name\":\"Lesser Despair\",\"sort\":1300000,\"system\":{\"actionType\":{\"value\":\"passive\"},\"actions\":{\"value\":null},\"category\":\"defensive\",\"description\":{\"value\":\"<p>30 feet.</p>\\n<p>Living creatures of the mummy creature’s level or lower are frightened 1 while in its despair aura. They can’t naturally recover from this fear while in the area but recover instantly once they leave.</p>\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"\"},\"rules\":[{\"effects\":[],\"key\":\"Aura\",\"radius\":30,\"slug\":\"mummy-lesser-despair\",\"traits\":[\"divine\",\"emotion\",\"enchantment\",\"fear\",\"mental\"]}],\"slug\":null,\"traits\":{\"rarity\":\"common\",\"value\":[\"aura\",\"divine\",\"emotion\",\"enchantment\",\"fear\",\"mental\"]}},\"type\":\"action\"}");
        
        addWeakness(sb, {value:undeadWeaknessTable.lookup(sb.system.details.level.value), type:"fire"});
        
        sb.items.push(mummyAura);
        
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