
export interface Hook<T>
{
    value : T;
    setValue : (value: T) => void;
}

export function newHook<T>(value: T, setValue : (value: T) => void) : Hook<T>{
    return {value, setValue};
}