import {type StatBlockProp} from "./components/StatBlock.tsx";
import {useState} from "react";
import {capitalize} from "./components/TypeScriptHelpFunctions.tsx";
import {ArrowFatDownIcon, ArrowFatUpIcon} from "@phosphor-icons/react";


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
            {LevelMinMaxArea(setFilters, filters)}
        </div>
        <div className=" flex">
            {TraitsArea(filters, setFilters)}
        </div>
        <div className=" flex gap-2 justify-around">
            {SortArea(filters, setFilters)}
        </div>
        <div
            className=" flex-[8] overflow-y-scroll border-1 border-gray-300">{CreaturesArea(FilterAndSortCreatures(allCreatures, filters), onSelectCreature)}</div>
    </div>);
}

function SortArea(filter : FilterValues, filterSetter : (value : FilterValues) => void)
{
    return (
        <div className="p-2 flex space-x-2 w-full">
            <div>Sort:</div>

            {/* LEVEL BUTTON */}
            <div
                className="bg-gray-300 hover:bg-gray-600 hover:text-white rounded-3xl p-1 w-1/3 select-none flex items-center justify-center space-x-0"
                onClick={() => {
                    switch (filter.sort) {
                        case "LevelUp":
                            filterSetter({ ...filter, sort: "LevelDown" });
                            break;
                        case "LevelDown":
                            filterSetter({ ...filter, sort: "LevelUp" });
                            break;
                        default:
                            filterSetter({ ...filter, sort: "LevelUp" });
                            break;
                    }
                }}
            >
                {/* fixed-width icon placeholder */}
                <div className="w-5 flex justify-center">
                    {filter.sort === "LevelUp" && <ArrowFatDownIcon weight="fill" />}
                    {filter.sort === "LevelDown" && <ArrowFatUpIcon weight="fill" />}
                </div>
                <span>Level</span>
            </div>

            {/* NAME BUTTON */}
            <div
                className="bg-gray-300 hover:bg-gray-600 hover:text-white rounded-3xl p-1 w-1/3 select-none flex items-center justify-center space-x-0"
                onClick={() => {
                    switch (filter.sort) {
                        case "NameUp":
                            filterSetter({ ...filter, sort: "NameDown" });
                            break;
                        case "NameDown":
                            filterSetter({ ...filter, sort: "NameUp" });
                            break;
                        default:
                            filterSetter({ ...filter, sort: "NameUp" });
                            break;
                    }
                }}
            >
                <div className="w-5 flex justify-center">
                    {filter.sort === "NameUp" && <ArrowFatDownIcon weight="fill" />}
                    {filter.sort === "NameDown" && <ArrowFatUpIcon weight="fill" />}
                </div>
                <span>Name</span>
            </div>
        </div>
    );

}

function LevelMinMaxArea(setFilters: (value: (((prevState: FilterValues) => FilterValues) | FilterValues)) => void, filters: FilterValues) {
    return <>
        <div className="flex gap-4">
            <div className="text-xs">Min lvl.</div>
            <input className="input-field" placeholder="-1" onChange={e =>
            {
                let val = -1;
                if (e.target.value !== "")
                    val = Number.parseInt(e.target.value);
                setFilters({...filters, min: val})
            }}></input>
        </div>
        <div className="flex gap-4">
            <div className="text-xs">Max lvl.</div>
            <input className="input-field" placeholder="25" onChange={e =>
            {
                let val = 25;
                if (e.target.value !== "")
                    val = Number.parseInt(e.target.value);
                setFilters({...filters, max: val})
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

function TraitsArea(filter : FilterValues,filterSetter : (f : FilterValues) => void){
    return(<div className="gap-2">
        <p>Traits:</p>
        {traits.map(value => {
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
                    {value.system.traits.value.map((value, i) =>{return(<span className="text-gray-500 text-xs" key={i}>{capitalize(value)} | </span>);} )}
                </div>)
            })}            
        </div>
    )
}