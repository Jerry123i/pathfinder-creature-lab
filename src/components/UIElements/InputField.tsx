import type {Hook} from "../Hook.tsx";
import type {ReactNode} from "react";


export function IntFieldWithButtons(hook : Hook<number>) : ReactNode
{
    const inputField = 
        <input
            value={hook.value}
            onChange={(val)=>
            {
                const value = Number.parseInt(val.target.value);
                if (isNaN(value)) return;
                hook.setValue(value);
            }
        } 
               type="number" 
               className="input-field w-16 bg-gray-200 p-0 px-1"></input>
    return inputField;
}

export function IntFieldWithButtonsFunction(hook : Hook<number>, func : (a:number)=>number) : ReactNode
{
    const inputField =
        <input
            onChange={(val)=>
                {
                    const value = Number.parseInt(val.target.value);
                    if (isNaN(value)) return;
                    hook.setValue(func(value));
                }
            }
            type="number"
            className="input-field w-16 bg-gray-200 p-0 px-1"></input>
    return inputField;
}