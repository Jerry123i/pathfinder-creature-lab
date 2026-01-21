import type {Hook} from "../Hook.tsx";
import type {ReactNode} from "react";


export function IntFieldWithButtons(hook : Hook<number>) : ReactNode
{
    const inputField = <input onChange={(val)=> hook.setValue(Number.parseInt(val.target.value))} type="number" className="input-field w-16 bg-gray-200 p-0 px-1"></input>
    return inputField;
}