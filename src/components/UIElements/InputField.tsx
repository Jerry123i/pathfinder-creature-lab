import type {Hook} from "../Hook.tsx";
import type {ReactNode} from "react";

export function ToggleWithTextAndIcon(checkValue : boolean, onChangeValue : (a:boolean)=>void, text: string, icon : ReactNode)
{   
    return <>
        <div className="mx-1">
            <div className="flex items-center gap-1">
                {icon}
                <span className="select-none">{text}</span>
                <input
                    type="checkbox"
                    value={checkValue?1:0}
                    onChange={(e) => onChangeValue(e.target.checked)}
                />
            </div>
        </div>
    </>
}

export function IntFieldWithButtons(hook : Hook<number>, level : number) : ReactNode
{
    const min = -1 - level;
    const max = 24 - level;
    
    const inputField = 
        <input
            value={hook.value}
            onChange={(val)=>
            {
                const value = Number.parseInt(val.target.value);
                if (isNaN(value)) {
                    hook.setValue(Math.max(min, Math.min(max, 0)));
                    return;
                }
                const clampedValue = Math.max(min, Math.min(max, value));
                hook.setValue(clampedValue);
            }
        } 
               type="number" 
               min={min}
               max={max}
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