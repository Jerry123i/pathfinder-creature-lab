import {type StatsJson} from "./components/StatBlock.tsx";
import {useState} from "react";
import {capitalize} from "./components/TypeScriptHelpFunctions.tsx";
import {ArrowFatDownIcon, ArrowFatUpIcon} from "@phosphor-icons/react";
import {type Hook, newHook} from "./components/Hook.tsx";


export function DropDown(list: StatsJson[], onValueChange: (i: number) => void) {
    return (<select className="bg-amber-50 p-1 pb-2 justify-center rounded-md" onChange={(e) => onValueChange(Number(e.target.value))}>
        {list.map((item: StatsJson, index) =>
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

export interface SidebarProps{
    allCreatures: StatsJson[],
    OnSetCreature: (creature: StatsJson) => void
}

export function SideBar({allCreatures, OnSetCreature} : SidebarProps)
{
    const [filters, setFilters] = useState<FilterValues>({min: -1, max: 30, sort: "LevelUp", nameFilter: "", traitsArray: []});
    const filtersHook = newHook<FilterValues>(filters, setFilters);
    
    return(
    <div className="grow sticky top-3 flex-col flex max-h-[97vh] bg-amber-200 rounded-xl space-y-2 p-2">
        <div className="">
            <div className="flex gap-4">
                <div>Name</div>
                <input className="grow input-field" placeholder="Name" onChange={(e) => {
                    setFilters({...filters, nameFilter: e.target.value})
                }}></input>
            </div>
        </div>
        <div className="flex  gap-4">
            <LevelMinMaxArea {...filtersHook} />
        </div>
        <div className=" flex">
            <TraitsArea {...filtersHook} />
        </div>
        <div className=" flex gap-2 justify-around">
            <SortArea {...filtersHook} />
        </div>
        <div className=" flex-[8] overflow-y-scroll border-1 border-gray-300">
            <CreaturesList creatures={filterAndSortCreatures(allCreatures, filters)} onSetCreature={OnSetCreature}/>
        </div>
    </div>);
}

function SortArea(filtersHook : Hook<FilterValues>)
{
    return (
        <div className="p-2 flex space-x-2 w-full">
            <div>Sort:</div>

            {/* LEVEL BUTTON */}
            <div
                className="bg-gray-300 hover:bg-gray-600 hover:text-white rounded-3xl p-1 w-1/3 select-none flex items-center justify-center space-x-0"
                onClick={() => {
                    switch (filtersHook.value.sort) {
                        case "LevelUp":
                            filtersHook.setValue({ ...filtersHook.value, sort: "LevelDown" });
                            break;
                        case "LevelDown":
                            filtersHook.setValue({ ...filtersHook.value, sort: "LevelUp" });
                            break;
                        default:
                            filtersHook.setValue({ ...filtersHook.value, sort: "LevelUp" });
                            break;
                    }
                }}
            >
                {/* fixed-width icon placeholder */}
                <div className="w-5 flex justify-center">
                    {filtersHook.value.sort === "LevelUp" && <ArrowFatDownIcon weight="fill" />}
                    {filtersHook.value.sort === "LevelDown" && <ArrowFatUpIcon weight="fill" />}
                </div>
                <span>Level</span>
            </div>

            {/* NAME BUTTON */}
            <div
                className="bg-gray-300 hover:bg-gray-600 hover:text-white rounded-3xl p-1 w-1/3 select-none flex items-center justify-center space-x-0"
                onClick={() => {
                    switch (filtersHook.value.sort) {
                        case "NameUp":
                            filtersHook.setValue({ ...filtersHook.value, sort: "NameDown" });
                            break;
                        case "NameDown":
                            filtersHook.setValue({ ...filtersHook.value, sort: "NameUp" });
                            break;
                        default:
                            filtersHook.setValue({ ...filtersHook.value, sort: "NameUp" });
                            break;
                    }
                }}
            >
                <div className="w-5 flex justify-center">
                    {filtersHook.value.sort === "NameUp" && <ArrowFatDownIcon weight="fill" />}
                    {filtersHook.value.sort === "NameDown" && <ArrowFatUpIcon weight="fill" />}
                </div>
                <span>Name</span>
            </div>
        </div>
    );

}

function LevelMinMaxArea(filtersHook : Hook<FilterValues>) {
    return <>
        <div className="flex gap-4">
            <div className="text-xs">Min lvl.</div>
            <input className="input-field" placeholder="-1" onChange={e =>
            {
                let val = -1;
                if (e.target.value !== "")
                    val = Number.parseInt(e.target.value);
                filtersHook.setValue({...filtersHook.value, min: val})
            }}></input>
        </div>
        <div className="flex gap-4">
            <div className="text-xs">Max lvl.</div>
            <input className="input-field" placeholder="25" onChange={e =>
            {
                let val = 25;
                if (e.target.value !== "")
                    val = Number.parseInt(e.target.value);
                filtersHook.setValue({...filtersHook.value, max: val})
            }}></input>
        </div>
    </>;
}

const traits = ["Air", "Fire", "Earth", "Metal", "Water", "Wood", "Human", "Dragon", "Animal", "Beast", "Plant", "Incorporeal", "Ooze", "Undead", "Construct", "Troop"]
// const traits : (string|string[])[] =
//     ["Elements",
//     ["Air", "Fire", "Earth", "Metal", "Water", "Wood"],
//     "Fiend",
//     ["Fiend", "Devil", "Daemon", "Demon"],
//     "Celestial",
//     ["Celestial", "Azata", "Angel", "Archon"],
//     "Monitor",
//     ["Monitor", "Protean", "Psychopomp", "Aeon"],
//     "Other Planes",
//     ["Fey", "Shadow", "Dream"],
//     "Ancestries",
//     ["Human", "Goblin", "Elf", "Dwarf", "Orc", "Halfling", "Gnome"],
//     "Type",
//     ["Dragon", "Animal", "Beast", "Plant", "Undead", "Construct"],
//     "Other",
//     ["Troop"]
//     ]

function TraitsArea(filterHook : Hook<FilterValues>) {
    return(<div className="gap-2">
        <p>Traits:</p>
        {traits.map(value => {
            return (<span className="mx-1 whitespace-nowrap ">
                    <label>
                        <input type="checkbox" onChange = {
                            (e)=>{
                                const newValue = structuredClone(filterHook.value);
                                if (e.target.checked)
                                    newValue.traitsArray.push(value);    
                                else
                                    newValue.traitsArray = newValue.traitsArray.filter(v => v !== value);
                                filterHook.setValue(newValue);
                            }
                        }></input>
                        <span className="px-1 select-none">{value}</span>
                    </label>
            </span>)
        })}
    </div>);
} 

function filterAndSortCreatures(creatures: StatsJson[], filter: FilterValues) : StatsJson[] 
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

interface CreaturesListProps{
    creatures : StatsJson[],
    onSetCreature : (creature: StatsJson) => void
}

function CreaturesList({creatures, onSetCreature} : CreaturesListProps)
{
    return(<div className="">
            {creatures.map(value => {
                return(<div className="border-1 border-gray-400 p-2 rounded-2xl bg-gray-200 m-2 select-none hover:bg-gray-600 hover:text-white " key={value._id}
                            onClick={()=> { 
                                onSetCreature(value)
                            }}>
                    <p>{value.name}     {value.system.details.level.value}</p>
                    {value.system.traits.value.map((value, i) =>{return(<span className="text-gray-500 text-xs" key={i}>{capitalize(value)} | </span>);} )}
                </div>)
            })}            
        </div>
    )
}