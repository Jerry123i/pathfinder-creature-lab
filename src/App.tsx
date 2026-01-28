
import {type StatsJson} from "./components/StatBlock.tsx";
import {applyLevelAdjustment, CreatureAdjustmentList} from "./components/Modifiers/Modifiers.tsx";
import {applyAllAdjustments} from "./components/Modifiers/Modifiers.tsx";
import type {CreatureAdjustment} from "./components/Modifiers/Modifiers.tsx";
import StatBlock from "./components/StatBlock.tsx";
import {useState} from "react";
import {SideBar} from "./Sidebar.tsx";
import {
    CaretCircleDownIcon,
    CaretCircleRightIcon,
} from "@phosphor-icons/react";
import {type Hook, newHook, type StatBlockControls} from "./components/Hook.tsx";

// eslint-disable-next-line react-refresh/only-export-components
export function loadMonsters()
{
    const modules = import.meta.glob("./assets/monsters/**/*.json", {eager:true});
    //const modules = import.meta.glob("./assets/monsters/*.json", {eager:true});
    const monsters = Object.values(modules) as StatsJson[];
    return monsters;
}

interface AbilitiesExtraInfo{
    isArea : boolean;
    isCooldown : boolean;
}

export interface AbilitiesExtraInfoDictionary{
    [id:string]:AbilitiesExtraInfo;
}

export function GetAdjustedIsArea(hook : Hook<AbilitiesExtraInfoDictionary>,id: string, value: boolean){
    const clone = hook.value;
    clone[id] = {isArea:value, isCooldown:clone[id].isCooldown};
    return clone;
}

export function GetAdjustedIsCooldown(hook : Hook<AbilitiesExtraInfoDictionary>,id: string, value: boolean){
    const clone = hook.value;
    clone[id] = {isArea:clone[id].isArea, isCooldown:value};
    return clone;
}

function App()
{
    const [currentBaseCreature, setCreature] = useState<StatsJson>();
    const [selectedAdjustmentIndexes, setSelectedAdjustments] = useState<number[]>([]);
    const [indexOfOpenCategories, setIndexOfOpenCategories] = useState<boolean[]>([]);
    
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    const descriptionOpen = newHook(isDescriptionOpen, setIsDescriptionOpen);
    const [powerTierVisionValue, setPowerVision] = useState(false);
    const powerTierVision = newHook(powerTierVisionValue, setPowerVision);
    const [isLevelerOpen, setLevelerOpen] = useState(false);
    const levelerOpen = newHook(isLevelerOpen, setLevelerOpen);
    const [levelerValue, setLevelerValue] = useState<number>(0);
    const levelerControls = newHook(levelerValue, setLevelerValue);
    const [abilitiesExtraInfoValue, abilitiesExtraInfoSet] = useState<AbilitiesExtraInfoDictionary>({});
    const abilitiesInfoControls = newHook(abilitiesExtraInfoValue, abilitiesExtraInfoSet);
    
    const statBlockControls : StatBlockControls =
    {
        isDescriptionOpen : descriptionOpen,
        showPowerTier : powerTierVision,
        showLevelerControls : levelerOpen,
        leveler : levelerControls,
        abilitiesInfo : abilitiesInfoControls
    }
    
    const monsters = loadMonsters();

    const selectedAdjustments : CreatureAdjustment[] = [];
    for (let i = 0; i < selectedAdjustmentIndexes.length; i++) {
        selectedAdjustments.push(CreatureAdjustmentList[selectedAdjustmentIndexes[i]])
    }

    let adjustedCreature = applyAllAdjustments(currentBaseCreature, selectedAdjustments)
    adjustedCreature = applyLevelAdjustment(adjustedCreature, levelerValue)

    
    const OnSetCreature = (creature : StatsJson)=>{
        setCreature(creature);
        setSelectedAdjustments([]);
        setLevelerValue(0);
        setLevelerOpen(false);
    }


    const creatureAdjustmentsButtonsProps = {
        selectedAdjustments :selectedAdjustmentIndexes,
        selectedArraySetter: setSelectedAdjustments,
        categoriesOpen: indexOfOpenCategories,
        setCategoriesOpen: setIndexOfOpenCategories
    }
    
    return (
        <div className="flex bg-gray-50 min-h-screen">
            {/* Sidebar */}
            <div className="flex flex-1/5 bg-amber-100 border-amber-200 border-r-4 p-3">
                <SideBar allCreatures={monsters} OnSetCreature={OnSetCreature} />
            </div>

            {/* Main Content */}
            <div className="flex flex-4/5 flex-col">
                <div><CreatureAdjustmentButtons {...creatureAdjustmentsButtonsProps} /></div>
                <div><StatBlock value={adjustedCreature} baseValue={currentBaseCreature} controls={statBlockControls}/></div>
                <p className="text-xs mt-auto align text-right text-gray-500 pr-1 pb-1">Version 0.1</p>
            </div>
        </div>
    );
}

interface CreatureAdjustmentButtonsProps{
    selectedAdjustments: number[],
    selectedArraySetter: ((i: number[]) => void),
    categoriesOpen: boolean[],
    setCategoriesOpen : (val: boolean[]) => void
}

function CreatureAdjustmentButtons(props: CreatureAdjustmentButtonsProps)
{
    CreatureAdjustmentList.sort((a,b)=>{
        if(a.type === b.type)
            return a.name.localeCompare(b.name);
        
        if (a.type === "Level")
            return -1;
        if (b.type === "Level")
            return 1;
        
        if (a.type === "Ancestry")
            return -1;
        if (b.type === "Ancestry")
            return 1;
        
        if (a.type === "Elemental")
            return -1;
        if (b.type === "Elemental")
            return 1;

        if (a.type === "Undead")
            return -1;
        if (b.type === "Undead")
            return 1;
        
        if (a.type === "CreatureType")
            return -1;
        if (b.type === "CreatureType")
            return 1;
        
        return -1;
    })
    
    let lastType = "";
    
    let workingGroup = [];
    let buttonsGroup = [];
    const finalValue  = [];

    let groupsCount = 0;
    
    for (let i = 0; i < CreatureAdjustmentList.length; i++)
    {
        const item = CreatureAdjustmentList[i];
        
        if (lastType !== item.type)
        {
            const groupIndex = groupsCount;
            groupsCount += 1;
            
            lastType = item.type;

            if (i !== 0){
                finalValue.push(<div className={`p-1`}>{workingGroup}<div className={`flex gap-1 ${props.categoriesOpen[groupIndex-1]?"":"hidden"}`}>{buttonsGroup}</div></div>);
                workingGroup = [];
                buttonsGroup = [];
            }
            
            const header = <span className="flex font-bold cursor-pointer select-none items-center gap-1" onClick={()=>
            {
                const x = structuredClone(props.categoriesOpen);
                x[groupIndex] = !x[groupIndex];
                props.setCategoriesOpen(x);
            }}>{props.categoriesOpen[groupIndex]?<CaretCircleDownIcon size={18} weight="fill" />:<CaretCircleRightIcon size={18} weight="bold" />} <h3>{item.type}</h3></span>;
            workingGroup.push(header);
        }

        const button =(<button className={`px-2 py-0.5 border-white border-1 hover:border-green-500 rounded-md ${props.selectedAdjustments.includes(i)?"bg-green-100 text-green-950 outline-green-100 outline-1" : ""}`} key={item._id}
                               onClick={()=>{
                                   props.selectedArraySetter(handleCreatureAdjustmentClick(props.selectedAdjustments, i))
                               }}>{item.name}</button>)
        
        //workingGroup.push(button);
        buttonsGroup.push(button);
        
        if (i === CreatureAdjustmentList.length - 1)
        {
            finalValue.push(<div className={`p-1`}>{workingGroup}<div className={`flex gap-1 ${props.categoriesOpen[groupsCount-1]?"":"hidden"}`}>{buttonsGroup}</div></div>);
            workingGroup = [];
            buttonsGroup = [];
        }
    }
    
    if (props.categoriesOpen.length === 0)
    {
        const array : boolean[] = [];
        for (let i = 0; i < groupsCount; i++)
            array.push(false);
        array[0] = true;
        props.setCategoriesOpen(array);
    }
    
    return <div className="bg-green-900 text-green-50 px-3 py-1">{finalValue}</div>;
}

function handleCreatureAdjustmentClick(existingArray : number[] ,value : number) : number[]
{
    let newArray = structuredClone(existingArray);

    if (!newArray.includes(value)){
        newArray.push(value);

        if (value === 0){
            if (newArray.includes(1))
                newArray = newArray.filter(i => i !== 1);
        }

        if (value === 1){
            if (newArray.includes(0))
                newArray = newArray.filter(i => i !== 0);
        }

        return newArray;
    }

    return newArray.filter(item => item !== value);

}

export default App;
