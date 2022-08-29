import { Reaction } from "./crafting";
import { createRand } from "./utils/createRand";


export function generateCraftingTargets({
    reactions, seed, targets, substanceCount
}: {
    reactions: Reaction[];
    seed: string;
    targets: string[];
    substanceCount: number;
}) {
    return targets.map(targetSeed => {
        const checkReactivity = true;

        const rand = createRand(seed + "craftingTargets" + targetSeed);
        for (let tryCount = 0; tryCount < 100; tryCount++) {
            const target = [
                rand.rangeInt(substanceCount),
                rand.rangeInt(substanceCount),
                rand.rangeInt(substanceCount),
            ];
            if (!checkReactivity) {
                return target;
            }
            const applicableReactions1 = reactions.some(ra => ra.reagents[1] === target[1]
                && ra.reagents[0] === target[0]);
            if (applicableReactions1) { continue; }

            const applicableReactions2 = reactions.some(ra => ra.reagents[1] === target[2]
                && ra.reagents[0] === target[1]);
            if (applicableReactions2) { continue; }

            return target;
        }
        throw "craftingTargets tryCount limit exceeded";
    });
}
