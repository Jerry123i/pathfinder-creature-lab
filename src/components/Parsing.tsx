import {capitalize} from "./TypeScriptHelpFunctions.tsx";

export const damageRegex = /@Damage\[((?:,?\(?(?:\d+(?:(?:\+|-?)\d+)?|\d+d\d+(?:(?:\+|-?)\d+)?|\d+\[\w+\])\)?\[(?:,?@*\.*\w+)+\])+)(?:\|[\w+-:]+)?\](?:\{[\w +-]+\})?/g;
export const splitDamageDiceRegex = /^,?\(?(\d+(?:(?:\+|-?)\d+)?|\d+d\d+(?:(?:\+|-?)\d+)?|\d+\[\w+\])\)?\[(?:,?([@.\w]+))?(?:,?([@.\w]+))?\]$/;
export const checkRegex = /@Check\[(\w+)(?:\|(?!dc:)[ ,\w:-]+)*(?:\|dc:(\d+))?(?:\|(?!dc:)[ ,\w:-]+)*\](?:\{([\w ]+)?\})?/gi;
export const actionTooltipRegex = /\[\[\/act ([\w-]+)(?: dc=(\d+))?(?: skill=(\w+))?(?: options=(?:[\w-]+))?(?: statistic=(?:[\w-]+))?\]\](?:\{([\w ]+)\})?/g;

export function parseAbilityDescription(input: string): string {
    let output = input;

    //Pathfinder icons replacement
    output = output.replace(/<span class="action-glyph">1<\/span>/g,
        () => `<span class="pathfinder-action">A</span>`)
    output = output.replace(/<span class="action-glyph">a<\/span>/gi,
        () => `<span class="pathfinder-action">A</span>`)
    output = output.replace(/<span class="action-glyph">2<\/span>/g,
        () => `<span class="pathfinder-action">D</span>`)
    output = output.replace(/<span class="action-glyph">3<\/span>/g,
        () => `<span class="pathfinder-action">T</span>`)
    output = output.replace(/<span class="action-glyph">R<\/span>/g,
        () => `<span class="pathfinder-action">R</span>`)
    output = output.replace(/<span class="action-glyph">F<\/span>/g,
        () => `<span class="pathfinder-action">F</span>`)

    output = output.replace(
        /@actor\.flags\.pf2e\.energyGland\.type/g,
        () => `energy`
    );

    output = output.replace(
        /@actor\.flags\.pf2e\.powerSource/g,
        () => `energy`
    )

    output = output.replace(
        /@item\.flags\.pf2e\.rulesSelections\.breathWeapon/g,
        () => `energy`
    )

    output = output.replace(
        /@item\.flags\.pf2e\.rulesSelections\.bombingBarrage/g,
        () => `energy`
    )

    output = output.replace(
        /@UUID\[[^\]]*\.Item\.[^\]]*]\{([^}]*)\}/g,
        (_match, label) => `<nobr><b>${label}</b></nobr>`
    );

    output = output.replace(
        /@UUID\[[^\]]*\.Item\.([^\]]*)\]/g,
        (_match, name) => `<nobr><b>${name}</b></nobr>`
    );

    output = output.replace(
        /@UUID\[[^\]]*\.Actor\.([^\]]*)\]/g,
        (_match, name) => `<nobr><b>${name}</b></nobr>`
    );

    
    output = output.replace(damageRegex, (_match, damageInfoMatch) => {
            const split = damageInfoMatch.toString().split(/(?<=\]),/);
            const rolls: { dice: string, dmgType1: string, dmgType2: string }[] = [];

            for (const s of split) {
                const results = s.match(/^,?\(?(\d+(?:(?:\+|-?)\d+)?|\d+d\d+(?:(?:\+|-?)\d+)?|\d+\[\w+\])\)?\[(?:,?(\w+))?(?:,?(\w+))?\]$/);
                rolls.push({dice: results[1], dmgType1: results[2], dmgType2: results[3]});
                //rolls.push(`${results[1]} ${results[2]} ${results[3]===undefined?"":results[3]}`);
            }

            let fullString = "";

            for (let i = 0; i < rolls.length; i++) {
                const roll = rolls[i];

                if (roll.dmgType1 === "healing") {
                    fullString += `${roll.dice} Healing`;
                } else {
                    fullString += `${roll.dice} ${roll.dmgType1}${roll.dmgType2 === undefined ? "" : ` and ${roll.dmgType2}"`}`;
                }

                if (rolls.length > 1) {
                    if (i === rolls.length - 2)
                        fullString += " plus";
                    else if (i !== rolls.length - 1)
                        fullString += ",";
                }

                fullString += " ";
            }

            return `<b>${fullString}</b>`;

        }
    );
    
    output = output.replace( checkRegex, (_match, save, dc, text3) => {
            if (text3 !== undefined)
                return `<nobr><b>${text3}</b></nobr>`;

            if (dc !== undefined)
                return `<nobr><b>DC ${dc} ${capitalize(save)}</b></nobr>`;

            return `<nobr><b>${capitalize(save)}</b></nobr>`
        }
    );

    output = output.replace(
        /@Template\[(?:type:)?(emanation|cone|burst|aura|line)\|distance:(\d+)\](?:\{([\w+\- ]+)\})?/gi,
        (_match, shape, distance) => {
            //match3 exists not used
            return `<nobr><b>${distance}ft ${shape}</b></nobr>`
        }
    );

    output = output.replace(
        /\[\[\/gmr (\w+) #(?:\w| )+\]\](?:\{([^}]*)\})?/g,
        (_match, dice, text) => {
            if (text === undefined)
                return `<nobr><b>${dice}</b></nobr>`

            return `<nobr><b>${text}</b></nobr>`
        }
    );

    output = output.replace(
        /\[\[\/(?:b|s|p|)r \{?([\w+-]+)\}?(?: #[\w ]+)?\]\](?:\{([\w +-]+)\})?/g, //TODO Modify this if tracks a d20
        (_match, match1, match2) => {
            if (match2 === undefined)
                return (`<nobr><b>${match1}</b></nobr>`)

            return (`<nobr><b>${match2}</b></nobr>`)
        }
    );
    
    output = output.replace(actionTooltipRegex, (_match, text, dc, skill, text2) => {
            if (dc !== undefined)
                return `<nobr><b>[${capitalize(text)} DC ${dc}]</nobr></b>`

            if (text2 !== undefined)
                return `<nobr><b>${capitalize(text2)}</nobr></b>`

            if (text === undefined)
                return `<nobr><b>${capitalize(skill)}</nobr></b>`

            return `<nobr><b>${capitalize(text)}</nobr></b>`
        }
    )

    output = output.replace(
        /@Localize\[PF2E\.NPC\.Abilities\.Glossary\..+]/g,
        (_match) => ""
    );

    output = output.replace(
        /@UUID\[.+\.Actor\.(\w+)\]/g,
        (_match, content) => `<b>${content}</b>`
    );

    output = output.replace(/(<hr \/>(?:(?:<br>)*|(?:<p><\/p>)*)*)$/g, (_match) => "");

    //Last line cleanup
    output = output.replace(/(\n?(?:(?:<hr>)|(?:<hr \/>)|(?:<p><\/p>)))+(?:<\/p>)?$/, (_match) => "</p>");
    
    return output;
}