import type {ReactNode} from "react";

export function SquareButtonIcon(icon : ReactNode, action : () => null) : ReactNode
{
    return <div className="square-button" onClick={()=>action()}><div className="square-button-icon">{icon}</div></div>
}