import {
    addImmunity,
    addLanguages,
    addResistance,
    addSpeed,
    addWeaknesses,
    type CreatureAdjustment
} from "./Modifiers.tsx";
import {
    AddSpecialSenses,
    cloneStatBlock,
    type DamageRollInfo, DiceString,
    GetDice,
    type StatBlockProp
} from "../StatBlock.tsx";
import {AddTrait} from "../Traits.tsx";
import {type CreatureItemStrike, GetDamagesInfo, GetStrikes} from "../Strikes.tsx";
import {capitalize} from "../TypeScriptHelpFunctions.tsx";
import type {LookupTable} from "../LookupTable.tsx";

function elementalAdjustments(statblock: StatBlockProp, language: string, name: string) : StatBlockProp
{
    let sb = cloneStatBlock(statblock);
    AddTrait(sb,  name);
    sb = addLanguages(sb, language, true);
    sb.name = capitalize(name) + " " + sb.name;
    
    return sb;
}

const resistanceTable: LookupTable<number> = {
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

const hpReductionTable: LookupTable<number> = {
    ranges: [
        { min: -Infinity,  max: 3,  value: 6  },
        { min: 4,   max: 8,         value: 10 },
        { min: 9,   max: 13,        value: 20 },
        { min: 14,   max: Infinity, value: 30 }
    ],

    lookup(level: number): number {
        const x = this.ranges.find(r => level >= r.min && level <= r.max);
        return x?.value ?? 0;
    }
};

const hpIncreaseTable: LookupTable<number> = {
    ranges: [
        { min: -Infinity,  max: 3,  value: 3  },
        { min: 4,   max: 8,         value: 5 },
        { min: 9,   max: 13,        value: 10 },
        { min: 14,   max: Infinity, value: 15 }
    ],

    lookup(level: number): number {
        const x = this.ranges.find(r => level >= r.min && level <= r.max);
        return x?.value ?? 0;
    }
};

export const Air : CreatureAdjustment = 
{
    type: "Elemental",
    priority: 1,
    _id: "adj_air",
    name: "Air",
    description: "",
    
    apply: (statblock) =>
    {
        const sb = elementalAdjustments(statblock, "sussuran", "air");
        addSpeed(sb,  {type: "fly", value:25})
        return sb;
    }
}

export const Earth : CreatureAdjustment = 
{
    type: "Elemental",
    priority: 1,
    _id: "adj_earth",
    name: "Earth",
    description: "",
    
    apply: (statblock) =>
    {
        const  sb = elementalAdjustments(statblock, "petran", "earth");
        
        addSpeed(sb, {type:"burrow", value:sb.system.details.level.value >= 8?40:20})
        AddSpecialSenses(sb.system.perception, {type: "tremorsense", acuity:"imprecise", range: 60})
        
        return sb;
    }
}

export const Fire : CreatureAdjustment = 
{
    type: "Elemental",
    priority: 1,
    _id: "adj_fire",
    name: "Fire",
    description: "",
    
    apply: (statblock) =>
    {
        const sb = elementalAdjustments(statblock, "pyric", "fire");
        addImmunity(sb,  "fire");
        
        const strikes = GetStrikes(sb);
        //const newStrikes : CreatureItemStrike[];

        function ReplaceOneDiceWithFire(dmg: DamageRollInfo, itemStrike : CreatureItemStrike)
        {
            const dice = GetDice(dmg);
            if (dice.diceNumber === 1) {
                dmg.damageType = "fire";
            }
            else {
                if (dice.diceNumber)
                    dice.diceNumber -= 1;
                dmg.damage = DiceString(dice);
                
                const fireDmg = {damageType: "fire", damage: "1d" + dice.diceType}
                AddDmg(itemStrike, fireDmg);
            }
        }

        function AddDmg(s: CreatureItemStrike, dmgFire: { damage: string; damageType: string }) {
            s.system.damageRolls["elementalFireDamage"] = dmgFire;
        }

        for (let i = 0; i < strikes.baseStrikes.length; i++)
        {
            const s = strikes.baseStrikes[i];
            const dmg = GetDamagesInfo(s.system);
            
            let numberOfDice = 0;
            
            for (let j = 0; j < dmg.length; j++)
            {
                const dice = GetDice(dmg[j]);
                numberOfDice += dice.diceNumber??0;
                console.log(dice);
            }
            
            if(numberOfDice > 1)
            {
                let foundDmg = false;
                const damageRollInfos = Object.values(s.system.damageRolls) as DamageRollInfo[];
                for(const dmg of damageRollInfos)
                {
                    if (dmg.damageType !== "slashing" && dmg.damageType !== "piercing" && dmg.damageType !== "bludgeoning")
                    {
                        ReplaceOneDiceWithFire(dmg, s);
                        foundDmg = true;
                        break;
                    }
                }
                
                if (!foundDmg)
                    ReplaceOneDiceWithFire(damageRollInfos[0], s);
                
            }
            else{
                const dmgFire = {damage:"1", damageType: "fire"};
                AddDmg(s, dmgFire);                
            }
            
        }
        
        return sb;
        
    }
}

export const Metal : CreatureAdjustment =
{
    type: "Elemental",
    priority: 1,
    _id: "adj_metal",
    name: "Metal",
    description: "",

    apply: (statblock) => {
        const sb = elementalAdjustments(statblock, "talican", "metal");
        
        addResistance(sb,  {value:resistanceTable.lookup(sb.system.details.level.value), type:"electricity"});
        sb.system.attributes.hp.value -= hpReductionTable.lookup(sb.system.details.level.value);

        const strikes = GetStrikes(sb);
        
        for (let i = 0; i < strikes.baseStrikes.length; i++) 
        {
            const s = strikes.baseStrikes[i];
            let possibilities = ["versatile-s","versatile-p"];

            const damagesList = [];
            
            const damageRollInfos = Object.values(s.system.damageRolls) as DamageRollInfo[];
            for(const dmg of damageRollInfos)
            {
                damagesList.push(dmg.damageType);
            }
            
            if (!damagesList.includes("piercing") && !damagesList.includes("slashing"))
            {
                if (damagesList.includes("piercing") || s.system.traits.value.includes("versatile-p"))
                    possibilities = possibilities.filter(x=> x!= "versatile-p")

                if (damagesList.includes("slashing") || s.system.traits.value.includes("versatile-s"))
                    possibilities = possibilities.filter(x=> x!= "versatile-s")

                if (possibilities.length > 0)
                    s.system.traits.value.push(possibilities[0]);    
            }
            
        }

            return sb;
    }
}


export const Water : CreatureAdjustment =
{
    type: "Elemental",
    priority: 1,
    _id: "adj_water",
    name: "Water",
    description: "",

    apply: (statblock) => 
    {
        const sb = elementalAdjustments(statblock, "thalassic", "water");
        
        AddTrait(sb, "amphibious");

        const level = sb.system.details.level.value;
        sb.system.attributes.hp.value -= hpReductionTable.lookup(level);
        
        addResistance(sb, {type:"fire", value:resistanceTable.lookup(level)});
        
        addSpeed(sb,  {value:level >= 8?40:25, type:"swim"})
        
        return sb;   
    }
}

export const Wood : CreatureAdjustment =
{
    type: "Elemental",
    priority: 1,
    _id: "adj_wood",
    name: "Wood",
    description: "",

    apply: (statblock) =>
    {
        const sb = elementalAdjustments(statblock, "muan", "wood");

        const level = sb.system.details.level.value;
        
        sb.system.attributes.hp.value += hpIncreaseTable.lookup(level);
        
        addWeaknesses(sb, ["fire", "axes"], resistanceTable.lookup(level));

        return sb;
    }
}

