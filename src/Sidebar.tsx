import type {StatBlockProp} from "./components/StatBlock.tsx";


export function DropDown(list: StatBlockProp[], onValueChange: (i: number) => void) {
    return (<select className="bg-amber-50 p-1 pb-2 justify-center rounded-md" onChange={(e) => onValueChange(Number(e.target.value))}>
        {list.map((item: StatBlockProp, index) =>
            (<option value={index} key={item._id}>{item.name}</option>))
        })
    </select>)
}


export function SideBar(allCreatures: StatBlockProp[])
{
    return(
    <div className="grow sticky top-3 flex-col flex max-h-[97vh] bg-pink-500 space-y-2 p-2">
        <div className="  bg-[#00ffff] flex-1 space-y-1 space-x-2">
            <div>Name</div>
            <input className="grow input-field" placeholder="Name"></input>
        </div>
        <div className="flex bg-[#00ff00] flex-1 space-x-2">
            <div className="grow">
                <div className="text-xs">Min lvl.</div>
                <input className="grow input-field" placeholder="-1"></input>
            </div>
            <div className="grow">
                <div className="text-xs">Min lvl.</div>
                <input className="grow input-field" placeholder="25"></input>
            </div>
        </div>
        <div className="bg-[#6666ff] flex-1">{TraitsArea()}</div>
        <div className="bg-[#229933] flex flex-1 space-x-2">
            <span>Sort:</span>
            <span className="bg-gray-300 rounded-md p-1">Level</span>
            <span className="bg-gray-300 rounded-md p-1">Name</span>
        </div>
        <div className="bg-[#00ffff] flex-8 overflow-y-scroll">{CreaturesArea(allCreatures)}</div>
    </div>);
}

const TraitsPlaceholder = ["Fire", "Water", "Earth", "Air", "Zombie", "Shadow", "Human", "Goblin",  "Aiuvarin"]

function TraitsArea(){
    return(<div className="">
        {TraitsPlaceholder.map(value => {
            return (<span className="mx-1 whitespace-nowrap ">
                    <label>
                        <input type="checkbox"></input>
                        <span className="px-1 select-none">{value}</span>
                    </label>
            </span>)
        })}
    </div>);
} 

function CreaturesArea(creatures : StatBlockProp[])
{
    return(<div className="">
            {creatures.map(value => {
                return(<div className="border-1 border-gray-400 p-2 rounded-2xl bg-gray-200 m-2 select-none hover:bg-gray-600 hover:text-white ">
                    <p>{value.name}     {value.system.details.level.value}</p>
                </div>)
            })}            
        </div>
    )
}