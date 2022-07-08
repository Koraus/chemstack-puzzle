import { apipe } from "./utils/apipe";
import { createRand } from "./utils/createRand";
import * as it from "./utils/it";

export type SubstanceId = number;
export const {
    substances,
    reactions,
    target,
    ingredientSources,
} = (() => {
    const rand = createRand("4242");
    const substances = apipe(it.inf(), it.take(5), it.toArray());
    const randomSubstance = () => substances[Math.floor(rand() * substances.length)];
    const reactions = (() => {
        const randomReaction = () => ({
            reagents: [
                randomSubstance(),
                randomSubstance(),
            ] as [SubstanceId, SubstanceId],
            products: [
                randomSubstance(),
                ...(rand() < 0.5) ? [] : [
                    randomSubstance(),
                    ...(rand() < 0.5) ? [] : [
                        randomSubstance(),
                    ],
                ]
            ] as [SubstanceId] | [SubstanceId, SubstanceId] | [SubstanceId, SubstanceId, SubstanceId],
        });
    
        const arr = [randomReaction()];
        while (arr.length < 10) {
            const reaction = randomReaction();
            if (arr.some(r1 =>
                (r1.reagents[0] === reaction.reagents[0])
                && (r1.reagents[1] === reaction.reagents[1]))) {
                continue;
            }
            arr.push(reaction);
        }
        return arr;
    })();
    const target = (() => {
        rand();
        while (true) {
            const target = [
                randomSubstance(),
                randomSubstance(),
                randomSubstance(),
            ];
            const some1 = reactions.some(ra =>
                ra.reagents[1] === target[1]
                && ra.reagents[0] === target[0]);
            if (some1) { continue; }
            const some2 = reactions.some(ra =>
                ra.reagents[1] === target[2]
                && ra.reagents[0] === target[1]);
            if (some2) { continue; }
    
            return target;
        }
    })();
    const ingredientSources = substances.slice(0, 3);
    return {
        substances,
        reactions,
        target,
        ingredientSources,
    };
})()
