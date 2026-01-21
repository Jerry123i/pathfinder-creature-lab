
export interface Hook<T>
{
    value : T;
    setValue : (value: T) => void;
}

export function newHook<T>(value: T, setValue : (value: T) => void) : Hook<T>{
    return {value, setValue};
}

export interface StatBlockControls
{
    isDescriptionOpen : Hook<boolean>;
    showPowerTier : Hook<boolean>;
    showLevelerControls : Hook<boolean>;
    
    leveler : Hook<number>;
}