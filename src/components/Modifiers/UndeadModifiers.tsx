import {
    AddDarkVision,
    cloneStatBlock,
    type CreatureItem, GetDice,
    modifyAllSaves,
    type StatBlockProp
} from "../StatBlock.tsx";
import {
    addImmunities,
    addImmunity,
    addLanguages, addResistance,
    addResistances,
    addWeakness, addWeaknesses,
    type CreatureAdjustment
} from "./Modifiers.tsx";
import {AddTrait, ReplaceTrait} from "../Traits.tsx";
import type {LookupTable} from "../LookupTable.tsx";
import {
    type CreatureItemStrike,
    GetDamagesInfo,
    GetStrikes,
    getStrongerStrike,
    getWeakestStrike
} from "../Strikes.tsx";
import {
    moderateSpellAttackBonusTable,
    moderateSpellDcTable,
    moderateStrikeBonusTable,
    moderateStrikeDamageTable
} from "../../assets/GMTables.tsx";
import {AddSkill, getHighestSkill} from "../Skills.tsx";
import type {CreatureItemSpell, SpellcastingItem} from "../Spells.tsx";
import {capitalize} from "../TypeScriptHelpFunctions.tsx";

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
        sb = addLanguages(sb,  "necril", true);

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

        sb = addLanguages(sb,  "necril", true);
        
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
        
        const ghostlyPassage = JSON.parse("{\"_id\":\"\",\"_stats\":{\"compendiumSource\":\"Compendium.pf2e.bestiary-ability-glossary-srd.Item.TTCw5NusiSSkJU1x\"},\"img\":\"\",\"name\":\"Ghostly Passage\",\"sort\":400000,\"system\":{\"actionType\":{\"value\":\"action\"},\"actions\":{\"value\":1},\"category\":\"defensive\",\"description\":{\"value\":\"The creature Flies and, during this movement, can pass through walls, creatures, and other material obstacles as though incorporeal. It must begin and end its movement outside of any physical obstacles, and passing through solid material is difficult terrain.\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"Pathfinder Monster Core\"},\"rules\":[{\"key\":\"ActiveEffectLike\",\"mode\":\"override\",\"path\":\"system.attributes.hp.negativeHealing\",\"value\":true}],\"slug\":null,\"traits\":{\"rarity\":\"common\",\"value\":[]}},\"type\":\"action\"}");
        
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
        sb = addLanguages(sb,  "necril", true);

        sb.name = "Mummy " + sb.name;
        
        const mummyAura = JSON.parse("{\"_id\":\"\",\"img\":\"systems/pf2e/icons/actions/Passive.webp\",\"name\":\"Lesser Despair\",\"sort\":1300000,\"system\":{\"actionType\":{\"value\":\"passive\"},\"actions\":{\"value\":null},\"category\":\"defensive\",\"description\":{\"value\":\"<p>30 feet.</p>\\n<p>Living creatures of the mummy creature’s level or lower are frightened 1 while in its despair aura. They can’t naturally recover from this fear while in the area but recover instantly once they leave.</p>\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"\"},\"rules\":[{\"effects\":[],\"key\":\"Aura\",\"radius\":30,\"slug\":\"mummy-lesser-despair\",\"traits\":[\"divine\",\"emotion\",\"enchantment\",\"fear\",\"mental\"]}],\"slug\":null,\"traits\":{\"rarity\":\"common\",\"value\":[\"aura\",\"divine\",\"emotion\",\"enchantment\",\"fear\",\"mental\"]}},\"type\":\"action\"}");
        
        addWeakness(sb, {value:undeadWeaknessTable.lookup(sb.system.details.level.value), type:"fire"});
        
        sb.items.push(mummyAura);
        
        return sb;
    }
}

export const Shadow: CreatureAdjustment = {
    _id: "adj_shadow",
    name: "Shadow",
    description: "A shadow creature is little more than a sentient shadow powered by negative energy. Shadows can easily travel to and from the Shadow Plane.",
    priority: 1,
    type: "Undead",

    apply: (statblock: StatBlockProp) => {
        let sb = cloneStatBlock(statblock);

        sb = applyBaseUndead(sb);
        AddTrait(sb, "shadow");
        sb = addLanguages(sb, "necril", true);

        sb.name = "Shadow " + sb.name;

        const higherSkill = getHighestSkill(sb);
        
        if(higherSkill.name !== "stealth")
            AddSkill(sb, "stealth", higherSkill.value);    

        addImmunity(sb, "precision");
        const weaknessValue = undeadWeaknessTable.lookup(sb.system.details.level.value);
        addWeaknesses(sb, ["force", "ghost-touch", "vitality"], weaknessValue);

        // --- Replace speed with fly speed if not already able to fly ---
        {
            const base = sb.system.attributes.speed;
            let maxSpeed = base.value;

            for (const s of base.otherSpeeds ?? []) {
                if (s.value > maxSpeed) maxSpeed = s.value;
            }

            // If it cannot fly, convert its highest speed to fly and remove others
            const alreadyFly =
                base.otherSpeeds?.some((s) => s.type === "fly") ?? false;

            if (!alreadyFly) {
                base.value = 0;
                base.otherSpeeds = [{ type: "fly", value: maxSpeed }];
            } else {
                // Keep only fly speed entries
                if (base.otherSpeeds)
                    base.otherSpeeds = base.otherSpeeds.filter(
                        (s) => s.type === "fly"
                    );
            }
        }

        //--- Change physical Strike damage to magical void ---
        for (const strike of GetStrikes(sb).baseStrikes) {
            for (const dmg of Object.values(
                strike.system.damageRolls ?? {}
            ) as any[]) {
                dmg.damageType = "void";
            }

            // Ensure magical trait
            if (!strike.system.traits.value.includes("magical"))
                strike.system.traits.value.push("magical");
        }

        const darkness = JSON.parse("{\"_id\":\"sGyeCvgDJThi1CYg\",\"_stats\":{\"compendiumSource\":\"Compendium.pf2e.spells-srd.Item.4GE2ZdODgIQtg51c\"},\"img\":\"systems/pf2e/icons/spells/darkness.webp\",\"name\":\"Darkness\",\"sort\":200000,\"system\":{\"area\":{\"type\":\"burst\",\"value\":20},\"cost\":{\"value\":\"\"},\"counteraction\":false,\"damage\":{},\"defense\":null,\"description\":{\"value\":\"<p>You create a shroud of darkness that prevents light from penetrating or emanating within the area. Light does not enter the area and any non-magical light sources, such as a torch or lantern, do not emanate any light while inside the area, even if their light radius would extend beyond the darkness. This also suppresses magical light of your darkness spell's rank or lower. Light can't pass through, so creatures in the area can't see outside. From outside, it appears as a globe of pure darkness.</p>\\n<hr />\\n<p><strong>Heightened (4th)</strong> Even creatures with darkvision (but not greater darkvision) can barely see through the darkness. They treat targets seen through the darkness as @UUID[Compendium.pf2e.conditionitems.Item.Concealed].</p>\"},\"duration\":{\"sustained\":false,\"value\":\"1 minute\"},\"level\":{\"value\":2},\"location\":{\"heightenedLevel\":2,\"value\":\"\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"Pathfinder Player Core\"},\"range\":{\"value\":\"120 feet\"},\"requirements\":\"\",\"rules\":[],\"slug\":\"darkness\",\"target\":{\"value\":\"\"},\"time\":{\"value\":\"3\"},\"traits\":{\"rarity\":\"common\",\"traditions\":[\"arcane\",\"divine\",\"occult\",\"primal\"],\"value\":[\"concentrate\",\"darkness\",\"manipulate\"]}},\"type\":\"spell\"}") as CreatureItemSpell;
        const spellcasting = JSON.parse("{\"_id\":\"\",\"img\":\"systems/pf2e/icons/default-icons/spellcastingEntry.svg\",\"name\":\"Divine Innate Spells\",\"sort\":100000,\"system\":{\"autoHeightenLevel\":{\"value\":null},\"description\":{\"value\":\"\"},\"prepared\":{\"flexible\":false,\"value\":\"innate\"},\"proficiency\":{\"value\":0},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"\"},\"rules\":[],\"showSlotlessLevels\":{\"value\":false},\"slots\":{},\"slug\":null,\"spelldc\":{\"dc\":0,\"mod\":0,\"value\":0},\"tradition\":{\"value\":\"divine\"},\"traits\":{}},\"type\":\"spellcastingEntry\"}") as SpellcastingItem;
        
        spellcasting.system.spelldc.dc = moderateSpellDcTable.lookup(sb.system.details.level.value);
        spellcasting.system.spelldc.value = moderateSpellAttackBonusTable.lookup(sb.system.details.level.value);
        
        const id = crypto.randomUUID().replaceAll("-", "");

        darkness.system.location.value = id;
        spellcasting._id = id;
        
        const slinkInShadows = JSON.parse(`{"_id":"","img":"","name":"Slink in Shadows","type":"action","sort":400000,"system":{"actionType":{"value":"passive"},"actions":{"value":null},"category":"defensive","description":{"value":"The creature can Hide or end its Sneak in a creature’s or object’s shadow."},"traits":{"rarity":"common","value":[]}}}`);
        sb.items.push(slinkInShadows);
        sb.items.push(darkness);
        sb.items.push(spellcasting);

        return sb;
    }
};

export const Vampire: CreatureAdjustment = {
    _id: "adj_vampire",
    name: "Vampire",
    description: "A vampiric creature consumes the blood of the living for sustenance. It might also possess the compulsions and revulsions of a specific vampire bloodline.",
    priority: 1,
    type: "Undead",
    apply: (statblock: StatBlockProp) =>
    {
        const resistanceTable: LookupTable<number> = {
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

        const hpDecreaseTable: LookupTable<number> = {
            ranges: [
                { min: -Infinity,  max: -1,  value: -3 },
                { min: 0,   max: 1,  value: -5 },
                { min: 2,   max: 5,  value: -10 },
                { min: 6,   max: 10,  value: -20 },
                { min: 11,   max: Infinity,  value: -40 }
            ],

            lookup(level: number): number {
                const x = this.ranges.find(r => level >= r.min && level <= r.max);
                return x?.value ?? 0;
            }
        };
        
        let sb = cloneStatBlock(statblock);
        sb = applyBaseUndead(sb);

        sb.name = "Vampire " + sb.name;
        AddTrait(sb, "vampire");
        
        sb.system.attributes.hp.value = sb.system.attributes.hp.value + hpDecreaseTable.lookup(sb.system.details.level.value); 
        
        addResistance(sb, {value:resistanceTable.lookup(sb.system.details.level.value), type:"physical", doubleVs:[], exceptions:["silver"]})

        let fangStrike : CreatureItemStrike | undefined;
        
        for (const strike of GetStrikes(sb).baseStrikes)
        {
            if (strike.name.toLowerCase() === "jaws" || strike.name.toLowerCase() === "fangs" || strike.name.toLowerCase() === "tusks" || strike.name.toLowerCase() === "beak")
                fangStrike = strike;
        }

        if (fangStrike === undefined)
        {
            let strikeJson = "{\"_id\":\"\",\"img\":\"systems/pf2e/icons/default-icons/melee.svg\",\"name\":\"Fangs\",\"sort\":100000,\"system\":{\"attack\":{\"value\":\"\"},\"attackEffects\":{\"custom\":\"\",\"value\":[]},\"bonus\":{\"value\":0},\"damageRolls\":{\"0\":{\"damage\":\"X\",\"damageType\":\"piercing\"}},\"description\":{\"value\":\"\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"\"},\"range\":null,\"rules\":[],\"slug\":null,\"traits\":{\"rarity\":\"common\",\"value\":[\"agile\",\"finesse\"]}},\"type\":\"melee\"}";
            const weakestStrike = getWeakestStrike(sb);

            let damageDice : string;
            let bonus : number;

            if (weakestStrike === undefined)
            {
                bonus = moderateStrikeBonusTable.lookup(sb.system.details.level.value);
                damageDice = moderateStrikeDamageTable.lookup(sb.system.details.level.value);
            }
            else
            {
                bonus = weakestStrike.system.bonus.value;
                damageDice = GetDamagesInfo(weakestStrike.system)[0].damage;
            }

            strikeJson = strikeJson.replace(`"damage":"X"`, `"damage":"${damageDice}"`);

            fangStrike = JSON.parse(strikeJson);
            if (fangStrike !== undefined)
            {
                fangStrike.system.bonus.value = bonus;
                sb.items.push(fangStrike);    
            }
        }
        
        if (fangStrike !== undefined)
        {
            const jawsDamage = GetDice(GetDamagesInfo(fangStrike.system)[0]);
            let feedJson = "{\"_id\":\"\",\"_stats\":{\"compendiumSource\":\"\"},\"img\":\"\",\"name\":\"Feed\",\"sort\":400000,\"system\":{\"actionType\":{\"value\":\"action\"},\"actions\":{\"value\":1},\"category\":\"ofensive\",\"description\":{\"value\":\"<p><strong>Requirements</strong> The vampiric creature’s most recent action was a successful JAWSNAME Strike that dealt damage;</p><p><strong>Effect</strong> The vampiric creature drains blood from its victim, dealing JAWSDAMAGE damage and regaining HPGAIN Hit Points.</p>\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"Pathfinder Monster Core\"},\"rules\":[],\"slug\":null,\"traits\":{\"rarity\":\"common\",\"value\":[\"divine\",\"necromancy\"]}},\"type\":\"action\"}";
            feedJson = feedJson.replace("JAWSNAME", `<strong>${capitalize(fangStrike.name)}</strong>`)
            feedJson = feedJson.replace("HPGAIN", `@Damage[${resistanceTable.lookup(sb.system.details.level.value)}[healing]]`)
            feedJson = feedJson.replace("JAWSDAMAGE", `@Damage[${(jawsDamage.diceNumber??0)+jawsDamage.modifier}[void]]`)
            
            sb.items.push(JSON.parse(feedJson));
        }
        
      
        return sb;
    }
}

export const Wight: CreatureAdjustment = {
    _id: "adj_wight",
    name: "Wight",
    description: "All wights can drain life through their unarmed attacks, but some can draw life force through weapons as well.",
    priority: 1,
    type: "Undead",
    apply: (statblock: StatBlockProp) =>
    {
        let sb = cloneStatBlock(statblock);
        sb = applyBaseUndead(sb);

        AddTrait(sb, "wight");
        sb = addLanguages(sb, "necril", true);

        sb.name = "Wight " + sb.name;

        const level = sb.system.details.level.value;
        const drainLifeDc = moderateSpellDcTable.lookup(level);

        const drainLifeItemJson = `{"_id":"","img":"systems/pf2e/icons/actions/Passive.webp","name":"Drain Life","sort":300000,"system":{"actionType":{"value":"passive"},"actions":{"value":null},"category":"offensive","description":{"value":"<p>When the creature damages a living creature with this Strike, it gains [[/r ${Math.max(1,level)} #Temporary Hit Points]]{${Math.max(1,level)} temporary Hit Points}, and the target must succeed at a @Check[fortitude|dc:${drainLifeDc}] save or become drained 1.</p>"},"publication":{"license":"ORC","remaster":true},"rules":[],"slug":"wight-life-drain","traits":{"rarity":"common","value":["divine","necromancy"]}},"type":"action"}`;

        const drainLifeItem = JSON.parse(drainLifeItemJson);
        sb.items.push(drainLifeItem);


        const strongestStrike = getStrongerStrike(sb);
        if (strongestStrike) {
            const dmgInfo = GetDamagesInfo(strongestStrike.system);
            const dmg = dmgInfo[0];
            const dice = GetDice(dmg);


            const reduction = Math.floor(level / 2);
            const newMod = (dice.modifier ?? 0) - reduction;
            dmg.damage = `${dice.diceNumber}d${dice.diceType}${newMod >= 0 ? "+"+newMod : newMod}`;


// Add drain life effect
            if (!strongestStrike.system.attackEffects)
                strongestStrike.system.attackEffects = {custom: "", value: []};
            strongestStrike.system.attackEffects.value.push("wight-life-drain");
        }


        return sb;
    }
}