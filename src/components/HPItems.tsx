import {capitalize} from "./TypeScriptHelpFunctions.tsx";
import {printValue, type StatBlockProp} from "./StatBlock.tsx";
import {printFourSquares} from "./PhosphorIcons.tsx";

export interface Resistance
{
    type: string;
    value: number;
    exceptions?: string[];
    doubleVs?: string[];
}

export function PrintResistances(value: StatBlockProp) {
    return <>
        {value.system.attributes.resistances === undefined ? null : (
            <>
                <b> Resistances:</b>{" "}
                {value.system.attributes.resistances.map(res => (
                    <>{capitalize(res.type)} {res.value}
                        {res.exceptions && res.exceptions.length > 0?(` except ` + res.exceptions.map(except => except.toString())):("")}
                        {res.doubleVs && res.doubleVs.length > 0?(` doubled vs ` + res.doubleVs.map(double => double.toString())):("")}; </>
                ))}
            </>
        )}
    </>;
}

export function PrintImmunity(value: StatBlockProp) {
    return <>
        {value.system.attributes.immunities === undefined || value.system.attributes.immunities.length === 0 ? null : (
            <>
                <b> Immunities:</b>{" "}
                {value.system.attributes.immunities.map((imu, index) => (
                    <>{index === 0 ? null : ", "}{capitalize(imu.type)}</>
                ))}
            </>
        )}
    </>;
}

export function PrintWeakness(value: StatBlockProp) 
{
    return <>
        {value.system.attributes.weaknesses === undefined ? null : (
            <>
                <b> Weaknesses:</b>{" "}
                {value.system.attributes.weaknesses.map(res => (
                    <>{capitalize(res.type)} {res.value}; </>
                ))}
            </>
        )}
    </>;
}

export function isVoidHealing(value: StatBlockProp) 
{
    const voidHealing = value.items.filter(k => k.system.slug === "negative-healing" || k.system.slug === "void-healing");
    return voidHealing.length > 0;
}

export function GetFastHealing(value: StatBlockProp)
{
    const item = value.items.filter(i => i.system.slug === "fast-healing");
    
    if (item.length === 0) return undefined;
    return item[0];
}

export function GetRegeneration(value: StatBlockProp)
{
    const item = value.items.filter(i => i.system.slug === "regeneration");

    if (item.length === 0) return undefined;
    return item[0];    
}

export function PrintTroopThresholds(value: StatBlockProp)
{
    const troopItem = value.items.filter(i => i.system.slug === "troop-defenses");
    if(troopItem.length === 0) return undefined;

    // const regex = /<strong>Thresholds<\/strong>\s+(\d+)\s+\(3 segments\),\s+(\d+)\s+\(2 segments\)/;
    // const match = regex.exec(troopItem[0].system.description.value);

    const threeSections = Math.floor(value.system.attributes.hp.value * (2/3));
    const twoSections = Math.floor(value.system.attributes.hp.value * (1/3));

    // if (match) {
    //     threeSections = Number.parseInt(match[1]);
    //     twoSections = Number.parseInt(match[2]);
    // }

    return (
        <span className="inline-flex items-center">
            {printFourSquares(8, {a:true,b:true,c:true,d:true})}, <div className="inline-flex items-center gap-1">{threeSections}{printFourSquares(8, {a:true,b:true,c:true,d:false})}</div>, <div className="inline-flex items-center gap-1">{twoSections}{printFourSquares(8, {a:true,b:true,c:false,d:false})}</div>
        </span>
    );
}

export function PrintHP(value: StatBlockProp) 
{
    const troopItem = value.items.filter(i => i.system.slug === "troop-defenses");
    if(troopItem.length === 0){
        return <>{printValue(value.system.attributes.hp, "HP")}</>;    
    }

    //Troop HP
    // const regex = /<strong>Thresholds?<\/strong>\s+(\d+)\s+\(3 segments\),\s+(\d+)\s+\(2 segments\)/;
    // const match = regex.exec(troopItem[0].system.description.value);

    const threeSections = Math.floor(value.system.attributes.hp.value * (2/3));
    const twoSections = Math.floor(value.system.attributes.hp.value * (1/3));

    // if (match) {
    //     threeSections = Number.parseInt(match[1]);
    //     twoSections = Number.parseInt(match[2]);
    // }

    return (
        <span className="inline-flex items-center gap-0.5">
            <div className="inline-flex items-center gap-1">{printValue(value.system.attributes.hp, "HP")}{printFourSquares(8, {a:true,b:true,c:true,d:true})}</div>, <div className="inline-flex items-center gap-1">{threeSections}{printFourSquares(8, {a:true,b:true,c:true,d:false})}</div>, <div className="inline-flex items-center gap-1">{twoSections}{printFourSquares(8, {a:true,b:true,c:false,d:false})}</div>
        </span>
    );
    
}