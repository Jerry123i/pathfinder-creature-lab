import {cloneStatBlock, type StatBlockProp} from "./components/StatBlock.tsx";
import {useState} from "react";


export function DropDown(list: StatBlockProp[], onValueChange: (i: number) => void) {
    return (<select className="bg-amber-50 p-1 pb-2 justify-center rounded-md" onChange={(e) => onValueChange(Number(e.target.value))}>
        {list.map((item: StatBlockProp, index) =>
            (<option value={index} key={item._id}>{item.name}</option>))
        })
    </select>)
}

export type FilterValues = {
    min : number;
    max : number;
    sort: "LevelUp" | "LevelDown" | "NameUp" | "NameDown";
    nameFilter : string;
    traitsArray: string[];
}

export function SideBar(allCreatures: StatBlockProp[], onSelectCreature: (creature: StatBlockProp) => void)
{
    const [filters, setFilters] = useState<FilterValues>({min: -1, max: 30, sort: "LevelUp", nameFilter: "", traitsArray: []});
    
    return(
    <div className="grow sticky top-3 flex-col flex max-h-[97vh] bg-pink-500 space-y-2 p-2">
        <div className="  bg-[#00ffff] flex-1 space-y-1 space-x-2">
            <div>Name</div>
            <input className="grow input-field" placeholder="Name" onChange={(e)=>{setFilters({...filters, nameFilter:e.target.value})}}></input>
        </div>
        <div className="flex bg-[#00ff00] flex-1 space-x-2">
            <div className="grow">
                <div className="text-xs">Min lvl.</div>
                <input className="grow input-field" placeholder="-1" onChange={e => {setFilters({...filters,min:Number.parseInt(e.target.value)})}}></input>
            </div>
            <div className="grow">
                <div className="text-xs">Min lvl.</div>
                <input className="grow input-field" placeholder="25" onChange={e => {setFilters({...filters,max:Number.parseInt(e.target.value)})}}></input>
            </div>
        </div>
        <div className="bg-[#6666ff] flex-1">
            {TraitsArea(filters, setFilters)}
        </div>
        <div className="bg-[#229933] flex flex-1 space-x-2 justify-around">
            {SortArea(filters, setFilters)}
        </div>
        <div className="bg-[#00ffff] flex-8 overflow-y-scroll">{CreaturesArea(FilterAndSortCreatures(allCreatures, filters), onSelectCreature)}</div>
    </div>);
}

function SortArea(filter : FilterValues, filterSetter : (value : FilterValues) => void)
{
    return(
        <div className="p-4 flex space-x-2 w-4/5">
            <div>Sort:</div>
            <div className="bg-gray-300 rounded-3xl p-1 w-1/3 text-center select-none"
             onClick={()=>
            {
                switch(filter.sort){
                    case "LevelUp":
                        filterSetter({...filter, sort:"LevelDown"})
                        break;
                    case "LevelDown":
                        filterSetter({...filter, sort:"LevelUp"})
                        break;
                    case "NameUp":
                        filterSetter({...filter, sort:"LevelUp"})
                        break;
                    case "NameDown":
                        filterSetter({...filter, sort:"LevelUp"})
                        break;
                }
                return;
            
            }}>{filter.sort == "LevelUp" ? "⬇️ " : ""}{filter.sort == "LevelDown" ? "⬆️ " : ""}Level</div>
            <div className="bg-gray-300 rounded-3xl p-1 w-1/3 text-center select-none"
                 onClick={()=>
                 {
                     switch(filter.sort){
                         case "LevelUp":
                             filterSetter({...filter, sort:"NameUp"})
                             break;
                         case "LevelDown":
                             filterSetter({...filter, sort:"NameUp"})
                             break;
                         case "NameUp":
                             filterSetter({...filter, sort:"NameDown"})
                             break;
                         case "NameDown":
                             filterSetter({...filter, sort:"NameUp"})
                             break;
                     }
                     return;

                 }}
            >{filter.sort == "NameUp" ? "⬇️ " : ""}{filter.sort == "NameDown" ? "⬆️ " : ""}Name</div>
        </div>
    )
}

const TraitsPlaceholder = ["Fire", "Dragon", "Water", "Earth", "Air", "Undead", "Shadow", "Human", "Goblin",  "Aiuvarin"]

function TraitsArea(filter : FilterValues,filterSetter : (f : FilterValues) => void){
    return(<div className="">
        {TraitsPlaceholder.map(value => {
            return (<span className="mx-1 whitespace-nowrap ">
                    <label>
                        <input type="checkbox" onChange = {
                            (e)=>{
                                const newValue = structuredClone(filter);
                                if (e.target.checked)
                                    newValue.traitsArray.push(value);    
                                else
                                    newValue.traitsArray = newValue.traitsArray.filter(v => v !== value);
                                filterSetter(newValue);
                            }
                        }></input>
                        <span className="px-1 select-none">{value}</span>
                    </label>
            </span>)
        })}
    </div>);
} 

function FilterAndSortCreatures(creatures: StatBlockProp[], filter: FilterValues) : StatBlockProp[] 
{
    let creaturesToShow = creatures;
    
    if (filter.traitsArray.length > 0)
        creaturesToShow = creaturesToShow.filter(creature =>
        {
            for (let i = 0; i < creature.system.traits.value.length; i++)
            {
                for (let j = 0; j < filter.traitsArray.length; j++)
                {
                    if (creature.system.traits.value[i].toLowerCase() === filter.traitsArray[j].toLowerCase())
                        return true;
                }    
            }
            return false;
        })
    
    if (filter.nameFilter !== "")
    {
        creaturesToShow = creaturesToShow.filter(creature => (creature.name.toLowerCase()).includes(filter.nameFilter.toLowerCase()))    
    }
    
    creaturesToShow = creaturesToShow.filter(creature => {
        return (creature.system.details.level.value  >= filter.min) && (creature.system.details.level.value  <= filter.max)
    })
    
    switch (filter.sort) {
        case "LevelUp":
            creaturesToShow.sort((a,b) =>{return a.system.details.level.value - b.system.details.level.value})
            break;
        case "LevelDown":
            creaturesToShow.sort((a,b) =>{return b.system.details.level.value - a.system.details.level.value})
            break;
        case "NameUp":
            creaturesToShow.sort((a,b) => {return a.name.localeCompare(b.name)});
            break;
        case "NameDown":
            creaturesToShow.sort((a,b) => {return b.name.localeCompare(a.name)});
            break;

    }
    
    return creaturesToShow;
}

function CreaturesArea(creatures : StatBlockProp[], onSelectCreature : (creature: StatBlockProp) => void)
{
    return(<div className="">
            {creatures.map(value => {
                return(<div className="border-1 border-gray-400 p-2 rounded-2xl bg-gray-200 m-2 select-none hover:bg-gray-600 hover:text-white " key={value._id}
                            onClick={()=> { onSelectCreature(value) }}>
                    <p>{value.name}     {value.system.details.level.value}</p>
                </div>)
            })}            
        </div>
    )
}