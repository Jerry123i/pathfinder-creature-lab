export function capitalize(word: string): string 
{
    if (word === undefined) {
        return "";
    } 
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}