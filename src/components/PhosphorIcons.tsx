import { SquareIcon } from '@phosphor-icons/react';

export const printFourSquares = (size:number, squares :{a:boolean,b:boolean,c:boolean,d:boolean}) => {
    
    const iconSize = size;

    return (
        <div className="inline-grid grid-cols-2 gap-0">
            <SquareIcon size={iconSize} weight={squares.a?"fill":"regular"} />
            <SquareIcon size={iconSize} weight={squares.b?"fill":"regular"} />
            <SquareIcon size={iconSize} weight={squares.c?"fill":"regular"} />
            <SquareIcon size={iconSize} weight={squares.d?"fill":"regular"} />
        </div>
    );
}