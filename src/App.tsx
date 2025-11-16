
import type {StatBlockProp} from "./components/StatBlock.tsx";
import {CreatureAdjustmentList} from "./components/Modifiers.tsx";
import {applyAllAdjustments} from "./components/Modifiers.tsx";
import type {CreatureAdjustment} from "./components/Modifiers.tsx";
import statBlock from "./components/StatBlock.tsx";
import {useState} from "react";


// eslint-disable-next-line react-refresh/only-export-components
export function loadMonsters(){
    const modules = import.meta.glob("./assets/monsters/*.json", {eager:true});
    return Object.values(modules) as StatBlockProp[];
}

function App(){

    const [creatureSelectIndex, setCreature] = useState(0);
    const [selectedAdjustmentIndexes, setSelectedAdjustments] = useState<number[]>([]);

    const monsters = loadMonsters();

    const currentBaseCreature = monsters[creatureSelectIndex];

    const selectedAdjustments : CreatureAdjustment[] = [];
    for (let i = 0; i < selectedAdjustmentIndexes.length; i++) {
        selectedAdjustments.push(CreatureAdjustmentList[selectedAdjustmentIndexes[i]])
    }

    const adjustedCreature = applyAllAdjustments(currentBaseCreature, selectedAdjustments)

    return (
        <div className="flex bg-gray-50">
            {/* Sidebar */}
            <div className=" bg-amber-100 border-amber-200 border-r-4 p-3">
                {DropDown(monsters, setCreature)}
            </div>

            {/* Main Content */}
            <div className="p-3">
                {CreatureAdjustmentButtons(selectedAdjustmentIndexes, setSelectedAdjustments)}
                {statBlock(adjustedCreature)}
            </div>
        </div>
    );
}

function DropDown(list: StatBlockProp[], onValueChange: (i: number) => void) {
    return (<select className="bg-amber-50 p-1 pb-2 justify-center rounded-md" onChange={(e) => onValueChange(Number(e.target.value))}>
        {list.map((item: StatBlockProp, index) =>
            (<option value={index} key={item._id}>{item.name}</option>))
        })
    </select>)
}

function CreatureAdjustmentButtons(selectedAdjustments :number[], selectedArraySetter : ((i : number[]) => void))
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
    const finalValue  = [];

    const pressedButton = " bg-green-100 text-green-950 outline-green-100 outline-1"
    for (let i = 0; i < CreatureAdjustmentList.length; i++)
    {
        const item = CreatureAdjustmentList[i];
        
        if (lastType !== item.type)
        {   
            lastType = item.type;

            if (i !== 0){
                finalValue.push(<div className="p-1 space-x-2 space-y-1">{workingGroup}</div>);
                workingGroup = [];
            }
            
            const header = <h3 className="font-bold">{">"} {item.type}</h3>;
            workingGroup.push(header);
        }

        const button =(<button className={`px-2 py-0.5 border-white border-1 rounded-md ${selectedAdjustments.includes(i)?"bg-green-100 text-green-950 outline-green-100 outline-1" : ""}`} key={item._id}
                               onClick={()=>{
                                   //On Click
                                   selectedArraySetter(handleCreatureAdjustmentClick(selectedAdjustments, i))
                               }}>{item.name}</button>)
        
        workingGroup.push(button);
        
        if (i === CreatureAdjustmentList.length - 1)
        {
            finalValue.push(<div className="p-1 space-x-2 space-y-1">{workingGroup}</div>);
            workingGroup = [];
        }
    }
    
    return <div className="bg-green-900 text-green-50">{finalValue}</div>;
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
