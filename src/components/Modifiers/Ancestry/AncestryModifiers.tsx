import {cloneStatBlock, type StatBlockProp} from "../../StatBlock.tsx";
import {ModifyAbilitiesAndRelatedStats} from "../../Abilities.tsx";
import {AddTrait, RemoveTrait, ReplaceTrait} from "../../Traits.tsx";
import {addLanguages, type CreatureAdjustment} from "../Modifiers.tsx";

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
    language?: string;
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

    if (ancestry.language) sb = addLanguages(sb, ancestry.language, true);
    
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
    language: "amurrum",
    abilityModifiers : {dex: 1, cha: 1, wis: -1},
    traitChanges: { replace: [{ from: "human", to: "catfolk" }] },
    apply: (statBlock) => AncestryAdjustmentFunction(Catfolk, statBlock),
}

export const Dwarf: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_dwarf",
    name: "Dwarf",
    description: "Dwarves are a short, stocky people who are often stubborn, fierce, and devoted.",
    namePrefix: "Dwarf",
    language: "dwarven",
    abilityModifiers: { con: 1, wis: 1, cha: -1 },
    traitChanges: { replace: [{ from: "human", to: "dwarf" }] },
    apply: (statBlock) =>  AncestryAdjustmentFunction(Dwarf, statBlock)
};

export const Elf: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_elf",
    name: "Elf",
    description: "Elves are a tall, long-lived people with a strong tradition of art and magic.",
    namePrefix: "Elf ",
    abilityModifiers: { dex: 1, int: 1, con: -1 },
    traitChanges: { replace: [{ from: "human", to: "elf" }] },
    apply: (statBlock) => AncestryAdjustmentFunction(Elf, statBlock)
};

export const Gnome: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_gnome",
    name: "Gnome",
    description: "Gnomes are short and hardy folk, with an unquenchable curiosity and eccentric habits.",
    namePrefix: "Gnome ",
    abilityModifiers: { con: 1, cha: 1, str: -1 },
    traitChanges: { replace: [{ from: "human", to: "gnome" }] },
    apply: (statBlock) => AncestryAdjustmentFunction(Gnome, statBlock)
};

export const Goblin: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_goblin",
    name: "Goblin",
    description: "Goblins are a short, scrappy, energetic people who have spent millennia maligned and feared.",
    namePrefix: "Goblin ",
    abilityModifiers: { dex: 1, cha: 1, wis: -1 },
    traitChanges: { replace: [{ from: "human", to: "goblin" }] },
    apply: (statBlock) => AncestryAdjustmentFunction(Goblin, statBlock)
};

export const Halfling: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_halfling",
    name: "Halfling",
    description: "Halflings are a short, resilient people who exhibit remarkable curiosity and humor.",
    namePrefix: "Halfling ",
    abilityModifiers: { dex: 1, wis: 1, str: -1 },
    traitChanges: { replace: [{ from: "human", to: "halfling" }] },
    apply: (statBlock) => AncestryAdjustmentFunction(Halfling, statBlock)
};

export const Leshy: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_leshy",
    name: "Leshy",
    description: "Leshies are immortal nature spirits placed in small plant bodies, seeking to experience the world.",
    namePrefix: "Leshy ",
    abilityModifiers: { con: 1, wis: 1, int: -1 },
    traitChanges: {
        replace: [{ from: "human", to: "leshy" }],
        remove: ["humanoid"],
        add: ["plant"]
    },
    apply: (statBlock) => AncestryAdjustmentFunction(Leshy, statBlock)
};

export const Orc: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_orc",
    name: "Orc",
    description: "Orcs are proud, strong people with hardened physiques who value physical might and glory in combat.",
    namePrefix: "Orc ",
    abilityModifiers: { str: 1 },
    traitChanges: { replace: [{ from: "human", to: "orc" }] },
    apply: (statBlock) => AncestryAdjustmentFunction(Orc, statBlock)
};

export const Minotaur: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_minotaur",
    name: "Minotaur",
    description: "Minotaurs are horned, bovine humanoids who originate from an ancient divine curse. Minotaurs are large, strong, and masters of crafts and puzzles.",
    namePrefix: "Minotaur ",
    abilityModifiers: { str: 1, con: 1, cha: -1 },
    traitChanges: { replace: [{ from: "human", to: "minotaur" }] },
    apply: (statBlock) => AncestryAdjustmentFunction(Minotaur, statBlock)
};

export const Merfolk: CustomAncestryCreatureAdjustment = {
    ...BASE_ANCESTRY,
    _id: "adj_merfolk",
    name: "Merfolk",
    description: "Merfolk are a half-human, half-fish aquatic people who live in every ocean and sea of Golarion.",
    namePrefix: "Merfolk ",
    abilityModifiers: { dex: 1, cha: 1, con: -1 },
    traitChanges: { replace: [{ from: "human", to: "merfolk" }] },
    apply: (statBlock) => AncestryAdjustmentFunction(Merfolk, statBlock)
};
