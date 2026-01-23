
import type {StatBlockProp} from "./components/StatBlock.tsx";
import {applyLevelAdjustment, CreatureAdjustmentList} from "./components/Modifiers/Modifiers.tsx";
import {applyAllAdjustments} from "./components/Modifiers/Modifiers.tsx";
import type {CreatureAdjustment} from "./components/Modifiers/Modifiers.tsx";
import statBlock from "./components/StatBlock.tsx";
import {useState} from "react";
import {SideBar} from "./Sidebar.tsx";
import {
    CaretCircleDownIcon,
    CaretCircleRightIcon,
} from "@phosphor-icons/react";
import {newHook, type StatBlockControls} from "./components/Hook.tsx";

// eslint-disable-next-line react-refresh/only-export-components
export function loadMonsters()
{
    const modules = import.meta.glob("./assets/monsters/**/*.json", {eager:true});
    //const modules = import.meta.glob("./assets/monsters/*.json", {eager:true});
    const monsters = Object.values(modules) as StatBlockProp[];
    return monsters;
}

function App()
{
    const [currentBaseCreature, setCreature] = useState<StatBlockProp>();
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
    
    const statBlockControls : StatBlockControls =
    {
        isDescriptionOpen : descriptionOpen,
        showPowerTier : powerTierVision,
        showLevelerControls : levelerOpen,
        leveler : levelerControls
    }
    
    const monsters = loadMonsters();

    const selectedAdjustments : CreatureAdjustment[] = [];
    for (let i = 0; i < selectedAdjustmentIndexes.length; i++) {
        selectedAdjustments.push(CreatureAdjustmentList[selectedAdjustmentIndexes[i]])
    }

    let adjustedCreature = applyAllAdjustments(currentBaseCreature, selectedAdjustments)
    adjustedCreature = applyLevelAdjustment(adjustedCreature, levelerValue)

    return (
        <div className="flex bg-gray-50 min-h-screen">
            {/* Sidebar */}
            <div className="flex flex-1/5 bg-amber-100 border-amber-200 border-r-4 p-3">
                {SideBar(monsters, setCreature, setSelectedAdjustments)}
            </div>

            {/* Main Content */}
            <div className="flex flex-4/5 flex-col">
                <div>{CreatureAdjustmentButtons(selectedAdjustmentIndexes, setSelectedAdjustments, indexOfOpenCategories, setIndexOfOpenCategories)}</div>       
                <div>{statBlock(adjustedCreature, statBlockControls)}</div>
                <p className="text-xs mt-auto align text-right text-gray-500 pr-1 pb-1">Version 0.1</p>
            </div>
        </div>
    );
}

function CreatureAdjustmentButtons(selectedAdjustments: number[], selectedArraySetter: ((i: number[]) => void), categoriesOpen: boolean[],setCategoriesOpen : (val: boolean[]) => void)
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
                finalValue.push(<div className={`p-1`}>{workingGroup}<div className={`flex gap-1 ${categoriesOpen[groupIndex-1]?"":"hidden"}`}>{buttonsGroup}</div></div>);
                workingGroup = [];
                buttonsGroup = [];
            }
            
            const header = <span className="flex font-bold cursor-pointer select-none items-center gap-1" onClick={()=>
            {
                const x = structuredClone(categoriesOpen);
                x[groupIndex] = !x[groupIndex];
                setCategoriesOpen(x);
            }}>{categoriesOpen[groupIndex]?<CaretCircleDownIcon size={18} weight="fill" />:<CaretCircleRightIcon size={18} weight="bold" />} <h3>{item.type}</h3></span>;
            workingGroup.push(header);
        }

        const button =(<button className={`px-2 py-0.5 border-white border-1 hover:border-green-500 rounded-md ${selectedAdjustments.includes(i)?"bg-green-100 text-green-950 outline-green-100 outline-1" : ""}`} key={item._id}
                               onClick={()=>{
                                   selectedArraySetter(handleCreatureAdjustmentClick(selectedAdjustments, i))
                               }}>{item.name}</button>)
        
        //workingGroup.push(button);
        buttonsGroup.push(button);
        
        if (i === CreatureAdjustmentList.length - 1)
        {
            finalValue.push(<div className={`p-1`}>{workingGroup}<div className={`flex gap-1 ${categoriesOpen[groupsCount-1]?"":"hidden"}`}>{buttonsGroup}</div></div>);
            workingGroup = [];
            buttonsGroup = [];
        }
    }
    
    if (categoriesOpen.length === 0)
    {
        const array : boolean[] = [];
        for (let i = 0; i < groupsCount; i++)
            array.push(false);
        array[0] = true;
        setCategoriesOpen(array);
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
