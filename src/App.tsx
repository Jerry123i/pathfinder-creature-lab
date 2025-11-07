
import type {StatBlockProp} from "./components/StatBlock.tsx";
import {CreatureAdjustmentList} from "./components/Modifiers.tsx";
import {applyAllAdjustments} from "./components/Modifiers.tsx";
import type {CreatureAdjustment} from "./components/Modifiers.tsx";
import statBlock from "./components/StatBlock.tsx";
import {useState} from "react";


// eslint-disable-next-line react-refresh/only-export-components
export function loadMonsters(){
    console.log("Load Monsters");
    const modules = import.meta.glob("./assets/monsters/*.json", {eager:true});
    return Object.values(modules) as StatBlockProp[];
}

function App(){

    const [creatureSelectIndex, setCreature] = useState(0);
    const [selectedAdjustmentIndexes, setSelectedAdjustments] = useState<number[]>([]);

    const monsters = loadMonsters();

    console.log(monsters[0].name); // "Monadic Deva"
    console.log(monsters[0].img);  // "systems/pf2e/icons/default-icons/npc.svg"
    console.log(monsters[0].items.length); // large number

    const currentBaseCreature = monsters[creatureSelectIndex];

    const selectedAdjustments : CreatureAdjustment[] = [];
    for (let i = 0; i < selectedAdjustmentIndexes.length; i++) {
        selectedAdjustments.push(CreatureAdjustmentList[selectedAdjustmentIndexes[i]])
    }

    const adjustedCreature = applyAllAdjustments(currentBaseCreature, selectedAdjustments)

    return (
        <div style={{display: "flex", alignItems: "flex-start"}}>
            {/* Sidebar */}
            <div style={{width: "220px", marginRight: "20px"}}>
                {DropDown(monsters, setCreature)}
            </div>

            {/* Main Content */}
            <div style={{flex: 1}}>
                {CreatureAdjustmentButtons(selectedAdjustmentIndexes, setSelectedAdjustments)}
                {statBlock(adjustedCreature)}
            </div>
        </div>
    );
}

function DropDown(list: StatBlockProp[], onValueChange: (i: number) => void) {
    return(<select onChange={(e) => onValueChange(Number(e.target.value))}>
        {list.map((item: StatBlockProp, index) =>
            (<option value={index} key={item._id}>{item.name}</option>))
        })
    </select>)
}

function CreatureAdjustmentButtons(selectedAdjustments :number[], selectedArraySetter : ((i : number[]) => void))
{
    
    return (
        <div>
        {CreatureAdjustmentList.map((item : CreatureAdjustment, index: number) =>
            (<button key={item._id}
                     onClick={()=>{
                         //On Click
                         selectedArraySetter(handleCreatureAdjustmentClick(selectedAdjustments, index))
                     }}>{item.name}</button>)
        )}
    </div>)
}

function handleCreatureAdjustmentClick(existingArray : number[] ,value : number) : number[]
{
    console.log(existingArray);
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
