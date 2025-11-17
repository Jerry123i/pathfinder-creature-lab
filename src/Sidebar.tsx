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
    return(<div className="">
        <div className="space-y-1 space-x-2">
            <span className="">Name</span>
            <input className="input-field" placeholder="Name"></input>
        </div>
        <div className="flex space-x-2">
            <div>
                <span className="text-xs">Min lvl.</span>
                <input className="input-field" placeholder="-1"></input>
            </div>
            <div>
                <span className="text-xs">Min lvl.</span>
                <input className="input-field" placeholder="25"></input>
            </div>
        </div>
        {TraitsArea()}
        {CreaturesArea(allCreatures)}
    </div>);
}

const TraitsPlaceholder = ["Fire", "Water", "Earth", "Air", "Zombie", "Shadow", "Human", "Goblin",  "Aiuvarin"]

function TraitsArea(){
    return(<div className=" bg-gray-100 p-2">
        {TraitsPlaceholder.map(value => {
            return (<div><input type="checkbox"></input><span className="px-1">{value}</span></div>)
        })}
    </div>);
} 

function CreaturesArea(creatures : StatBlockProp[])
{
    return(<div className="bg-gray-100 p-2">
            {creatures.map(value => {
                return(<div className="border-1 border-gray-400 p-2 rounded-2xl bg-gray-200 m-2 hover:bg-gray-600 hover:text-white">
                    <p>{value.name}     {value.system.details.level.value}</p>
                </div>)
            })}            
        </div>
    )
}