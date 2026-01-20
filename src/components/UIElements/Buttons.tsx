import type {ReactNode, SetStateAction} from "react";

function TogglableButton(contentOn:ReactNode, contentOff:ReactNode, toggleValue : boolean, setValue : ((a:boolean)=>void)):ReactNode
{
    return<div onClick={() => setValue(!toggleValue)}>{toggleValue?contentOn:contentOff}</div>
}

export function SquareButtonIcon(icon : ReactNode, toggleValue : boolean, setValue : ((a:boolean)=>void)) : ReactNode
{
    const on =  <div className="square-button bg-green-900"><div className="square-button-icon text-green-50">{icon}</div></div>;
    const off = <div className="square-button"><div className="square-button-icon">{icon}</div></div>;
    
    return TogglableButton(on, off, toggleValue, setValue);
}