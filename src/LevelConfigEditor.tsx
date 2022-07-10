import { useRecoilState } from 'recoil';
import update from "immutability-helper";
import { apipe } from "./utils/apipe";
import { createRand } from "./utils/createRand";
import * as it from "./utils/it";
import { atom, selector } from "recoil";
type CSSProperties = import("preact").JSX.CSSProperties;

export type SubstanceId = number;
export type Reaction = {
    reagents: 
        [SubstanceId, SubstanceId],
    products: 
        [SubstanceId] 
        | [SubstanceId, SubstanceId] 
        | [SubstanceId, SubstanceId, SubstanceId],
}

export function generateReactions({ seed, substanceCount, reactionCount }: {
    seed: string;
    substanceCount: number;
    reactionCount: number;
}) {
    const rand = createRand(seed + "reactions");
    const randomReaction = () => ({
        reagents: [
            rand.rangeInt(substanceCount),
            rand.rangeInt(substanceCount),
        ],
        products: [
            rand.rangeInt(substanceCount),
            ...(rand() < 0.5) ? [] : [
                rand.rangeInt(substanceCount),
                ...(rand() < 0.5) ? [] : [
                    rand.rangeInt(substanceCount),
                ],
            ]
        ],
    } as Reaction);

    const arr = [randomReaction()];
    while (arr.length < reactionCount) {
        const reaction = randomReaction();
        if (arr.some(r1 => (r1.reagents[0] === reaction.reagents[0])
            && (r1.reagents[1] === reaction.reagents[1]))) {
            continue;
        }
        arr.push(reaction);
    }
    return arr;
}

export function generateLevel({
    seed, substanceCount, ingredientCount, reactions,
}: {
    seed: string;
    substanceCount: number;
    ingredientCount: number;
    reactions: Reaction[];
}) {
    const rand = createRand(seed);
    const substances = apipe(it.inf(), it.take(substanceCount), it.toArray());
    const ingredients = substances.slice(0, ingredientCount);
    const target = (() => {
        rand();
        while (true) {
            const target = [
                rand.el(substances),
                rand.el(substances),
                rand.el(substances),
            ];
            const some1 = reactions.some(ra => ra.reagents[1] === target[1]
                && ra.reagents[0] === target[0]);
            if (some1) { continue; }
            const some2 = reactions.some(ra => ra.reagents[1] === target[2]
                && ra.reagents[0] === target[1]);
            if (some2) { continue; }

            return target;
        }
    })();
    return {
        substances,
        target,
        ingredients,
    };
}

export const levelConfigState = atom({
    key: "levelConfig",
    default: {
        seed: "4242",
        substanceCount: 5,
        ingredientCount: 3,
        reactionCount: 10,
    },
});

export const levelState = selector({
    key: "level",
    get: ({get}) => {
        const config = get(levelConfigState);
        const reactions = generateReactions(config);
        return ({
            ...config,
            reactions,
            ...generateLevel({...config, reactions})
        });
    },
})

export function LevelConfigEditor({ style }: { style?: CSSProperties }) {
    const [levelConfig, setLevelConfig] = useRecoilState(levelConfigState);
    return <div style={style}>
        <h3>Level config:</h3>
        <label>Seed: <input
            value={levelConfig.seed}
            onChange={ev => setLevelConfig(update(levelConfig, {
                seed: { $set: (ev.target as HTMLInputElement).value },
            }))} /></label><br />
        <label>Substance Count: <input
            type="number"
            value={levelConfig.substanceCount}
            onChange={ev => setLevelConfig(update(levelConfig, {
                substanceCount: { $set: (ev.target as HTMLInputElement).valueAsNumber },
            }))} /></label><br />
        <label>Ingredient Count: <input
            type="number"
            value={levelConfig.ingredientCount}
            onChange={ev => setLevelConfig(update(levelConfig, {
                ingredientCount: { $set: (ev.target as HTMLInputElement).valueAsNumber },
            }))} /></label><br />
        <label>Reaction Count: <input
            type="number"
            value={levelConfig.reactionCount}
            onChange={ev => setLevelConfig(update(levelConfig, {
                reactionCount: { $set: (ev.target as HTMLInputElement).valueAsNumber },
            }))} /></label><br />
    </div>;
}
