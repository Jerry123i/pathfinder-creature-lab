export function capitalize(word: string): string 
{
    if (word === undefined) {
        return "";
    }
    if (word === null)
        return "";
    
    if (word === "") {
        return "";
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}