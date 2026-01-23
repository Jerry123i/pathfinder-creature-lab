import type {ReactNode} from "react";
import type {Hook} from "../Hook.tsx";

function TogglableButton(contentOn:ReactNode, contentOff:ReactNode, toggleValue : boolean, setValue : ((a:boolean)=>void)):ReactNode
{
    return<div onClick={() => setValue(!toggleValue)}>{toggleValue?contentOn:contentOff}</div>
}

function TogglableButtonWithAction(contentOn:ReactNode, contentOff:ReactNode, toggleValue : boolean, 
                                   setValue : ((a:boolean)=>void), turnOnAction : (()=>void)|null, turnOffAction : (()=>void)|null):ReactNode
{
    return<div onClick={() => {
            const value = !toggleValue;    
                
            if (value && turnOnAction!=null)
                turnOnAction();
            
            if (!value && turnOffAction!=null)
                turnOffAction();
        
            setValue(value)
    }}>{toggleValue?contentOn:contentOff}</div>
}

export function SquareButtonIconWithAction(icon : ReactNode, hook:Hook<boolean>, turnOnAction : (()=>void)|null, turnOffAction : (()=>void)|null) : ReactNode
{
    const on =  <div className="square-button bg-green-900"><div className="square-button-icon text-green-50">{icon}</div></div>;
    const off = <div className="square-button"><div className="square-button-icon">{icon}</div></div>;
    
    return TogglableButtonWithAction(on, off, hook.value, hook.setValue, turnOnAction, turnOffAction);
}

export function SquareButtonIcon(icon : ReactNode, hook:Hook<boolean>) : ReactNode
{
    const on =  <div className="square-button bg-green-900"><div className="square-button-icon text-green-50">{icon}</div></div>;
    const off = <div className="square-button"><div className="square-button-icon">{icon}</div></div>;

    return TogglableButton(on, off, hook.value, hook.setValue);
}