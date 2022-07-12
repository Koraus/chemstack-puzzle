import { useRecoilState, useRecoilTransaction_UNSTABLE, useRecoilValue } from 'recoil';
import update, { Spec } from "immutability-helper";
import { apipe } from "./utils/apipe";
import { createRand } from "./utils/createRand";
import * as it from "./utils/it";
import { atom, selector } from "recoil";
import { substanceColors } from './substanceColors';
import { tubesState } from './CraftingTable';
import { actionsState } from './ActionLog';
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
    seed, substanceCount, ingredientCount, reactions, targets,
}: {
    seed: string;
    substanceCount: number;
    ingredientCount: number;
    reactions: Reaction[];
    targets: number[];
}) {
    const rand = createRand(seed);
    const substances = apipe(it.inf(), it.take(substanceCount), it.toArray());
    const ingredients = substances.slice(0, ingredientCount);
    const target = (() => {
        rand();
        while (true) {
            for (let i = 0; i < targets[0]; i++) {
                rand();
            }
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

export const levelPresets = [{
    substanceCount: 3,
    ingredientCount: 3,
    reactionCount: 5,
    targets: [0],
}, {
    substanceCount: 5,
    ingredientCount: 3,
    reactionCount: 10,
    targets: [0],
}, {
    substanceCount: 5,
    ingredientCount: 3,
    reactionCount: 10,
    targets: [1],
}, {
    substanceCount: 5,
    ingredientCount: 3,
    reactionCount: 10,
    targets: [2],
}, {
    substanceCount: 5,
    ingredientCount: 3,
    reactionCount: 10,
    targets: [3],
}, {
    substanceCount: 5,
    ingredientCount: 3,
    reactionCount: 10,
    targets: [4],
}, {
    substanceCount: 5,
    ingredientCount: 3,
    reactionCount: 10,
    targets: [5],
}, {
    substanceCount: 5,
    ingredientCount: 3,
    reactionCount: 10,
    targets: [6],
}].map((lp, i) => ({
    ...lp,
    seed: "4242",
    name: `Level ${(i + 1).toString().padStart(2, '0')}`,
}));

export const levelPresetState = atom({
    key: "levelPreset",
    default: levelPresets[0],
});

export const levelState = selector({
    key: "level",
    get: ({ get }) => {
        const config = get(levelPresetState);
        const reactions = generateReactions(config);
        return ({
            ...config,
            reactions,
            ...generateLevel({ ...config, reactions })
        });
    },
});

export function LevelList({ style }: { style?: CSSProperties }) {
    const levelPreset = useRecoilValue(levelPresetState);
    const setLevelPreset = useRecoilTransaction_UNSTABLE(({ get, set }) => (lp: typeof levelPreset) => {
        set(levelPresetState, lp)
        set(tubesState, [[]]);
        set(actionsState, []);
    });

    return <div style={{
        overflowY: "scroll",
        height: "140px",
        backgroundColor: "#ffffff20",
        ...style,
    }}>
        {levelPresets.map((s, i) =>
            i <= 1
                ? <a
                    href="#"
                    style={{
                        padding: "3px",
                        display: "block",
                        color: "white",
                        textDecoration: "none",
                        backgroundColor: s.name === levelPreset.name
                            ? "#ffffff50"
                            : "transparent",
                        textTransform: "uppercase",
                    }}
                    onClick={() => setLevelPreset(s)}
                >{s.name}</a>
                : <span
                    style={{
                        padding: "3px",
                        display: "block",
                        color: "grey",
                        textDecoration: "none",
                        backgroundColor: s.name === levelPreset.name
                            ? "#ffffff50"
                            : "transparent",
                        textTransform: "uppercase",
                    }}
                >{s.name}</span>
        )}
    </div>
};

export function LevelEditor({ style }: { style?: CSSProperties }) {
    const levelPreset = useRecoilValue(levelPresetState);
    const setLevelPreset = useRecoilTransaction_UNSTABLE(({ get, set }) => (lp: typeof levelPreset) => {
        set(levelPresetState, lp)
        set(tubesState, [[]]);
        set(actionsState, []);
    });

    return <div style={{
        backgroundColor: "#ffffff20",
        color: "white",
        ...style,
    }}>
        <h3 style={{
            margin: "0px",
            backgroundColor: "#ffffff50",
            paddingLeft: "20px",
        }}>Level preset</h3>
        <div style={{
            paddingLeft: "20px",
            paddingRight: "20px",
        }}>

            <label>Preset: <input 
                disabled 
                value={levelPreset.name} 
                style={{
                    width: "100px",
                    fontSize: "16px",
                    padding: "0px 5px",
                }}
            /></label><br />

            <label>Seed: <input
                value={levelPreset.seed}
                style={{
                    width: "100px",
                    fontSize: "16px",
                    padding: "0px 5px",
                }}
                onChange={ev => setLevelPreset(update(levelPreset, {
                    name: { $set: "custom level" },
                    seed: { $set: (ev.target as HTMLInputElement).value },
                }))} /></label><br />

            <label>Substances: <input
                type="number"
                style={{
                    width: "50px",
                    fontSize: "16px",
                    padding: "0px 5px",
                }}
                value={levelPreset.substanceCount}
                min={1}
                max={substanceColors.length}
                onChange={ev => setLevelPreset(update(levelPreset, {
                    name: { $set: "custom level" },
                    substanceCount: { $set: (ev.target as HTMLInputElement).valueAsNumber },
                }))} /></label><br />

            <label>Ingredients: <input
                type="number"
                style={{
                    width: "50px",
                    fontSize: "16px",
                    padding: "0px 5px",
                }}
                value={levelPreset.ingredientCount}
                min={1}
                max={levelPreset.substanceCount}
                onChange={ev => setLevelPreset(update(levelPreset, {
                    name: { $set: "custom level" },
                    ingredientCount: { $set: (ev.target as HTMLInputElement).valueAsNumber },
                }))} /></label><br />

            <label>
                Reactions: 
                <button
                    style={{ 
                        width: "30px",
                        fontSize: "16px",
                        padding: "0px 5px",
                    }}
                    onClick={() => setLevelPreset(update(levelPreset, {
                        name: { $set: "custom level" },
                        reactionCount: { $set: levelPreset.reactionCount - 1 },
                    }))}    
                >-</button>
                <input
                type="number"
                style={{
                    textAlign: "right",
                    width: "20px",
                    fontSize: "16px",
                    padding: "0px 5px",
                }}
                value={levelPreset.reactionCount}
                min={0}
                onChange={ev => setLevelPreset(update(levelPreset, {
                    name: { $set: "custom level" },
                    reactionCount: { $set: (ev.target as HTMLInputElement).valueAsNumber },
                }))} />
                <button
                    style={{ 
                        width: "30px",
                        fontSize: "16px",
                        padding: "0px 5px",
                    }}
                    onClick={() => setLevelPreset(update(levelPreset, {
                        name: { $set: "custom level" },
                        reactionCount: { $set: levelPreset.reactionCount + 1 },
                    }))}    
                >+</button>
            </label><br />
        </div>
    </div>;
}
