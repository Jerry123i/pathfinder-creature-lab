import {AddDarkVision, cloneStatBlock, type CreatureItem, type StatBlockProp} from "../../StatBlock.tsx";
import {ModifyAbilitiesAndRelatedStats} from "../../Abilities.tsx";
import {AddTrait, RemoveTrait, ReplaceTrait} from "../../Traits.tsx";
import {addLanguages, addSpeed, changeSize, type CreatureAdjustment} from "../Modifiers.tsx";
import type {LookupTable} from "../../LookupTable.tsx";

export interface AbilityModifiers {
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
}

export interface TraitChanges {
    add?: string[];
    remove?: string[];
    replace?: { from: string; to: string }[];
}

export interface CustomAncestryCreatureAdjustment extends CreatureAdjustment {
    abilityModifiers: AbilityModifiers;
    traitChanges?: TraitChanges;
    namePrefix?: string;
    languages?: string[];
}

// eslint-disable-next-line react-refresh/only-export-components
function AncestryAdjustmentFunction(ancestry : CustomAncestryCreatureAdjustment, statBlock : StatBlockProp) : StatBlockProp{
    let sb = cloneStatBlock(statBlock);

    for (const [key, value] of Object.entries(ancestry.abilityModifiers)) {
        ModifyAbilitiesAndRelatedStats(sb, key as keyof AbilityModifiers, value!);
    }

    if (ancestry.traitChanges) {
        ancestry.traitChanges.replace?.forEach(({ from, to }) =>
            ReplaceTrait(sb, from, to)
        );
        ancestry.traitChanges.remove?.forEach(t => RemoveTrait(sb, t));
        ancestry.traitChanges.add?.forEach(t => AddTrait(sb, t));
    }

    if (ancestry.languages){
        for (const l of ancestry.languages)
            sb = addLanguages(sb, l, true);    
    } 
    
    if (ancestry.namePrefix) sb.name = ancestry.namePrefix + " " + sb.name;
    
    return sb;
    
}

const BASE_ANCESTRY = {
    priority: 1,
    type: "Ancestry"
} as const;

export const Catfolk : CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_catfolk",
    name: "Catfolk",
    description: "Catfolk are highly social, feline humanoids prone to curiosity and wandering.",
    namePrefix: "Catfolk",
    languages: ["amurrum"],
    abilityModifiers : {dex: 1, cha: 1, wis: -1},
    traitChanges: { replace: [{ from: "human", to: "catfolk" }] },
    apply: (statBlock) =>
    {
        AddDarkVision(statBlock, "low-light-vision");
        return AncestryAdjustmentFunction(Catfolk, statBlock);
    } 
}

export const Dwarf: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_dwarf",
    name: "Dwarf",
    description: "Dwarves are a short, stocky people who are often stubborn, fierce, and devoted.",
    namePrefix: "Dwarf",
    languages: ["dwarven"],
    abilityModifiers: { con: 1, wis: 1, cha: -1 },
    traitChanges: { replace: [{ from: "human", to: "dwarf" }] },
    apply: (statBlock) =>   //TODO Clan Dagger
    {
        if (statBlock.system.attributes.speed.value > 20)
            statBlock.system.attributes.speed.value = 20;
        AddDarkVision(statBlock, "darkvision");    
        return AncestryAdjustmentFunction(Dwarf, statBlock); 
    }  
};

export const Elf: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_elf",
    name: "Elf",
    description: "Elves are a tall, long-lived people with a strong tradition of art and magic.",
    namePrefix: "Elf",
    languages: ["elven"],
    abilityModifiers: { dex: 1, int: 1, con: -1 },
    traitChanges: { replace: [{ from: "human", to: "elf" }] },
    apply: (statBlock) =>
    {
        if (statBlock.system.attributes.speed.value < 30)
            statBlock.system.attributes.speed.value = 30;
        AddDarkVision(statBlock, "low-light-vision");
        return AncestryAdjustmentFunction(Elf, statBlock);  
    } 
};

export const Gnome: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_gnome",
    name: "Gnome",
    description: "Gnomes are short and hardy folk, with an unquenchable curiosity and eccentric habits.",
    namePrefix: "Gnome",
    languages: ["fey", "gnomish"],
    abilityModifiers: { con: 1, cha: 1, str: -1 },
    traitChanges: { replace: [{ from: "human", to: "gnome" }] },
    apply: (statBlock) => //TODO add lore
    {
        AddDarkVision(statBlock, "low-light-vision");
        return AncestryAdjustmentFunction(Gnome, changeSize(statBlock, "small"));  
    } 
};

export const Goblin: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_goblin",
    name: "Goblin",
    description: "Goblins are a short, scrappy, energetic people who have spent millennia maligned and feared.",
    namePrefix: "Goblin",
    languages: ["goblin"],
    abilityModifiers: { dex: 1, cha: 1, wis: -1 },
    traitChanges: { replace: [{ from: "human", to: "goblin" }] },
    apply: (statBlock) =>
    {
        return AncestryAdjustmentFunction(Goblin, changeSize(statBlock, "small"));
    }
};

export const Halfling: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_halfling",
    name: "Halfling",
    description: "Halflings are a short, resilient people who exhibit remarkable curiosity and humor.",
    namePrefix: "Halfling",
    languages: ["halfling"],
    abilityModifiers: { dex: 1, wis: 1, str: -1 },
    traitChanges: { replace: [{ from: "human", to: "halfling" }] },
    apply: (statBlock) =>
    {
        const keenEyes : CreatureItem = JSON.parse("{\"_id\":\"48CFcDY5R0rTxFmv\",\"img\":\"systems/pf2e/icons/default-icons/action.svg\",\"name\":\"Keen Eyes\",\"sort\":600000,\"system\":{\"actionType\":{\"value\":\"passive\"},\"actions\":{\"value\":null},\"category\":\"offensive\",\"description\":{\"value\":\"<p>The halfling gains a +2 circumstance bonus when using the @UUID[Compendium.pf2e.actionspf2e.Item.Seek] action to find @UUID[Compendium.pf2e.conditionitems.Item.Hidden] or @UUID[Compendium.pf2e.conditionitems.Item.Undetected] creatures within 30 feet of it.</p>\\n<p>Whenever the halfling targets a creature that is @UUID[Compendium.pf2e.conditionitems.Item.Concealed] or hidden from them, reduce the DC of the flat check to @Check[flat|dc:3] for a concealed target or @Check[flat|dc:9] for a hidden one.</p>\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"\"},\"rules\":[{\"key\":\"FlatModifier\",\"predicate\":[\"action:seek\",{\"lte\":[\"target:distance\",30]},{\"or\":[\"target:hidden\",\"target:undetected\"]}],\"selector\":\"perception\",\"type\":\"circumstance\",\"value\":2}],\"slug\":null,\"traits\":{\"value\":[]}},\"type\":\"action\"}");;        
        statBlock.items.push(keenEyes);        
        return AncestryAdjustmentFunction(Halfling, changeSize(statBlock, "small"));
    }
};

export const Leshy: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_leshy",
    name: "Leshy",
    description: "Leshies are immortal nature spirits placed in small plant bodies, seeking to experience the world.",
    namePrefix: "Leshy",
    languages: ["fey"],
    abilityModifiers: { con: 1, wis: 1, int: -1 },
    traitChanges: {
        replace: [{ from: "human", to: "leshy" }, {from:"humanoid", to: "plant"}]
    },
    apply: (statBlock) => 
    {
        const healingTable: LookupTable<string> = {
            ranges: [
                { min: -1,  max: 0,  value: "1d4" },
                { min: 1,   max: 1,  value: "1d8" },
                { min: 2,   max: 3,  value: "2d8" },
                { min: 4,   max: 5,  value: "3d8" },
                { min: 6,   max: 7,  value: "4d8" },
                { min: 8,   max: 9,  value: "5d8" },
                { min: 10,  max: 11, value: "6d8" },
                { min: 12,  max: 13, value: "7d8" },
                { min: 14,  max: 15, value: "8d8" },
                { min: 16,  max: 17, value: "9d8" },
                { min: 18,  max: 19, value: "10d8" },
                { min: 20,  max: Infinity, value: "11d8" },
            ],

            lookup(level: number): string {
                const x = this.ranges.find(r => level >= r.min && level <= r.max);
                return x?.value ?? "1d4";
            }
        };
        
        let verdantBurstString = "{\"_id\":\"J8d6vqQrqGXi53bU\",\"img\":\"systems/pf2e/icons/actions/Passive.webp\",\"name\":\"Verdant Burst\",\"sort\":700000,\"system\":{\"actionType\":{\"value\":\"passive\"},\"actions\":{\"value\":null},\"category\":\"defensive\",\"deathNote\":true,\"description\":{\"value\":\"<p>When a leaf leshy dies, a burst of primal energy explodes from their body, restoring @Damage[1d4[healing]]{1d4 Hit Points} to each plant creature in a @Template[emanation|distance:30]. This area is filled with tree saplings, becoming difficult terrain.</p>\\n<p>If the terrain is not a viable environment for these trees, they wither after 24 hours.</p>\"},\"publication\":{\"license\":\"ORC\",\"remaster\":true,\"title\":\"\"},\"rules\":[],\"slug\":null,\"traits\":{\"rarity\":\"common\",\"value\":[\"healing\",\"primal\",\"vitality\"]}},\"type\":\"action\"}";
        const healingDice = healingTable.lookup(statBlock.system.details.level.value);
        verdantBurstString = verdantBurstString.replace("1d4", healingDice);
        const burst : CreatureItem = JSON.parse(verdantBurstString);
        statBlock.items.push(burst);
        
        AddDarkVision(statBlock, "low-light-vision");
        return AncestryAdjustmentFunction(Leshy, changeSize(statBlock, "small"))
    }
};

export const Orc: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_orc",
    name: "Orc",
    description: "Orcs are proud, strong people with hardened physiques who value physical might and glory in combat.",
    namePrefix: "Orc",
    abilityModifiers: { str: 1 },
    traitChanges: { replace: [{ from: "human", to: "orc" }] },
    apply: (statBlock) =>
    {
        AddDarkVision(statBlock, "darkvision");
        return AncestryAdjustmentFunction(Orc, statBlock)
    }
};

export const Minotaur: CustomAncestryCreatureAdjustment = { 
    ...BASE_ANCESTRY,
    _id: "adj_minotaur",
    name: "Minotaur",
    description: "Minotaurs are horned, bovine humanoids who originate from an ancient divine curse. Minotaurs are large, strong, and masters of crafts and puzzles.",
    namePrefix: "Minotaur",
    languages: ["jotun"],
    abilityModifiers: { str: 1, con: 1, cha: -1 },
    traitChanges: { replace: [{ from: "human", to: "minotaur" }] },
    apply: (statBlock) => //TODO Add horns
    {
        AddDarkVision(statBlock, "darkvision");
        return AncestryAdjustmentFunction(Minotaur, changeSize(statBlock, "large"));
    } 
};

export const Merfolk: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_merfolk",
    name: "Merfolk",
    description: "Merfolk are a half-human, half-fish aquatic people who live in every ocean and sea of Golarion.",
    namePrefix: "Merfolk",
    languages: ["thalassic"],
    abilityModifiers: { dex: 1, cha: 1, con: -1 },
    traitChanges: { 
        replace: [{ from: "human", to: "merfolk" }],
        add: ["amphibious"]},
    apply: (statBlock) => //TODO add Aquatic Grace and Hydration
    {
        if (statBlock.system.attributes.speed.value > 5)
            statBlock.system.attributes.speed.value = 5;
        addSpeed(statBlock, {type: "swim", value: 25})
        
        AddDarkVision(statBlock, "low-light-vision");
        
        return AncestryAdjustmentFunction(Merfolk, statBlock);
    }
};
