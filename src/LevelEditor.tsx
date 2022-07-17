import { useRecoilState, useRecoilTransaction_UNSTABLE, useRecoilValue } from 'recoil';
import update, { Spec } from "immutability-helper";
import { apipe } from "./utils/apipe";
import { createRand } from "./utils/createRand";
import * as it from "./utils/it";
import { atom, selector } from "recoil";
import { craftingActionsRecoil, tubesState } from './CraftingTable';
import { useEffect } from "preact/hooks";
import { Reaction } from './crafting';
import { reactionsLibraryRecoil } from './ReactionsLibrary';
import { css, cx } from "@emotion/css";
type CSSProperties = import("preact").JSX.CSSProperties;


export const levelPresets = [{
    substanceCount: 3,
    ingredientCount: 3,
    targets: [0],
}, {
    substanceCount: 4,
    ingredientCount: 3,
    targets: [0],
}, {
    substanceCount: 5,
    ingredientCount: 3,
    targets: [0],
}, {
    substanceCount: 5,
    ingredientCount: 3,
    targets: [1, 2],
}, {
    substanceCount: 5,
    ingredientCount: 3,
    targets: [2],
}, {
    substanceCount: 5,
    ingredientCount: 3,
    targets: [3],
}, {
    substanceCount: 5,
    ingredientCount: 3,
    targets: [4],
}, {
    substanceCount: 5,
    ingredientCount: 3,
    targets: [5],
}, {
    substanceCount: 5,
    ingredientCount: 3,
    targets: [6],
}].map((levelPrePreset, i) => ({
    ...levelPrePreset,
    seed: "4242",
    name: `Level ${(i + 1).toString().padStart(2, '0')}`,
    substanceMaxCount: 10,
}));

export const levelPresetRecoil = atom({
    key: "levelPreset",
    default: levelPresets[0],
});

export const gameProgressState = atom({
    key: "gameProgress",
    default: {} as Record<string, boolean>,
    effects: [({ node, setSelf, onSet }) => {
        const key = node.key;
        const savedValue = localStorage.getItem(key)
        if (savedValue != null) {
            setSelf(JSON.parse(savedValue));
        }

        onSet((newValue, _, isReset) => {
            isReset
                ? localStorage.removeItem(key)
                : localStorage.setItem(key, JSON.stringify(newValue));
        });
    }],
});

export function LoadHighestLevelEffect() {
    const gameProgress = useRecoilValue(gameProgressState);
    const setLevelPreset = useRecoilTransaction_UNSTABLE(({ get, set }) => (lp: typeof levelPresets[0]) => {
        set(levelPresetRecoil, lp);
        set(craftingActionsRecoil, []);
    });

    useEffect(() => {
        const highestProgressedIndex = Object.keys(gameProgress)
            .map(name => levelPresets.findIndex(x => x.name === name))
            .sort((a, b) => b - a)[0] ?? -1;
        setLevelPreset(levelPresets[highestProgressedIndex + 1]);
    }, []);

    return <></>;
}

export function LevelList({ style }: { style?: CSSProperties }) {
    const gameProgress = useRecoilValue(gameProgressState);
    const currentLevelPreset = useRecoilValue(levelPresetRecoil);
    const setLevelPreset = useRecoilTransaction_UNSTABLE(({ get, set }) => (lp: typeof currentLevelPreset) => {
        set(levelPresetRecoil, lp);
        set(craftingActionsRecoil, []);
    });

    return <div style={{
        overflowY: "scroll",
        height: "140px",
        backgroundColor: "#ffffff20",
        ...style,
    }}>{levelPresets.map(levelPreset => {
        const levelPresetIndex = levelPresets.findIndex(x => x.name === levelPreset.name);
        const isCurrent = levelPreset.name === currentLevelPreset.name;
        const isOpen =
            levelPresetIndex === 0
            || (levelPresetIndex > 0 && (levelPresets[levelPresetIndex - 1].name in gameProgress));
        return <a
            style={{
                padding: "3px",
                display: "block",
                textDecoration: "none",
                textTransform: "uppercase",
                color: "grey",

                ...(isOpen && {
                    color: "white"
                }),

                ...(isCurrent && {
                    backgroundColor: "#ffffff50",
                }),
            }}
            {...(isOpen && {
                href: "#",
                onClick: () => setLevelPreset(levelPreset)
            })}
        >{levelPreset.name}</a>
    })}</div>
};

export function LevelEditor({ style }: { style?: CSSProperties }) {
    const levelPreset = useRecoilValue(levelPresetRecoil);
    const setLevelPreset = useRecoilTransaction_UNSTABLE(({ get, set }) => (lp: typeof levelPreset) => {
        set(levelPresetRecoil, lp);
        set(craftingActionsRecoil, []);
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

            <div
                style={{
                    display: "inline-flex",
                    marginBottom: "4px",
                    marginTop: "4px",
                    alignItems: "center"
                }}
            > Seed: <input
                    style={{
                        marginLeft: "5px",
                    }}
                    value={levelPreset.seed}
                    onChange={ev => setLevelPreset(update(levelPreset, {
                        name: { $set: "custom level" },
                        seed: { $set: (ev.target as HTMLInputElement).value },
                    }))} />

                <button
                    className={css`
                        & {
                            padding: 0;
                            background-color: white;
                            font-size: 0;
                            margin-left:5px;
                        }
                    `}
                    onClick={() => {
                        const newSeed = Math.round(Math.random() * 10000).toString();
                        setLevelPreset(update(levelPreset, {
                            seed: { $set: newSeed },
                            name: { $set: "custom level" },
                        }));
                    }}
                    style={{
                    }}
                > <span class="material-symbols-rounded"> casino </span></button>
            </div>
            <br />

            <div
                style={{
                    display: "inline-flex",
                    marginBottom: "4px",
                    marginTop: "4px",
                    alignItems: "center",
                }}
            >
                Max Substances:
                <button
                    style={{
                        padding: "0",
                        backgroundColor: "white",
                        fontSize: "0",
                        marginRight: "5px",
                        border: "none",
                        minWidth: "24px",
                        maxHeight: "24px",
                        marginLeft: "5px"
                    }}
                    onClick={() => setLevelPreset(update(levelPreset, {
                        name: { $set: "custom level" },
                        substanceMaxCount: { $set: levelPreset.substanceMaxCount - 1 },
                    }))}
                > <span style={{ fontSize: "24px", lineHeight: "1" }}> - </span></button>
                {levelPreset.substanceMaxCount}
                <button
                    style={{
                        padding: "0",
                        backgroundColor: "white",
                        fontSize: "0",
                        marginLeft: "5px",
                        border: "none",
                        minWidth: "24px",
                        maxHeight: "24px",
                    }}
                    onClick={() => setLevelPreset(update(levelPreset, {
                        name: { $set: "custom level" },
                        substanceMaxCount: { $set: levelPreset.substanceMaxCount + 1 },
                    }))}
                > <span style={{ fontSize: "24px", lineHeight: "1" }}> + </span></button>
            </div>
            <br />

            <div
                style={{
                    display: "inline-flex",
                    marginBottom: "4px",
                    marginTop: "4px",
                    alignItems: "center",
                }}
            >Substances:
                <button
                    style={{
                        padding: "0",
                        backgroundColor: "white",
                        fontSize: "0",
                        marginRight: "5px",
                        border: "none",
                        minWidth: "24px",
                        maxHeight: "24px",
                        marginLeft: "5px"
                    }}
                    onClick={() => setLevelPreset(update(levelPreset, {
                        name: { $set: "custom level" },
                        substanceCount: { $set: levelPreset.substanceCount - 1 },
                    }))}
                > <span style={{ fontSize: "24px", lineHeight: "1" }}> - </span></button>
                <input
                    style={{
                        width: "50px",
                        fontSize: "16px",
                        padding: "0px 5px",
                    }}
                    value={levelPreset.substanceCount}
                    min={1}
                    max={levelPreset.substanceMaxCount}
                    onChange={ev => setLevelPreset(update(levelPreset, {
                        name: { $set: "custom level" },
                        substanceCount: { $set: (ev.target as HTMLInputElement).valueAsNumber },
                    }))} />
                <button
                    style={{
                        padding: "0",
                        backgroundColor: "white",
                        fontSize: "0",
                        marginLeft: "5px",
                        border: "none",
                        minWidth: "24px",
                        maxHeight: "24px",
                    }}
                    onClick={() => setLevelPreset(update(levelPreset, {
                        name: { $set: "custom level" },
                        substanceCount: { $set: levelPreset.substanceCount + 1 },
                    }))}
                > <span style={{ fontSize: "24px", lineHeight: "1" }}> + </span></button>
            </div>
            <br />




            <div style={{
                display: "inline-flex",
                marginBottom: "4px",
                marginTop: "4px",
                alignItems: "center",
            }}>Ingredients:
                <button
                    style={{
                        padding: "0",
                        backgroundColor: "white",
                        fontSize: "0",
                        marginRight: "5px",
                        border: "none",
                        minWidth: "24px",
                        maxHeight: "24px",
                        marginLeft: "5px"
                    }}
                    onClick={() => setLevelPreset(update(levelPreset, {
                        name: { $set: "custom level" },
                        ingredientCount: { $set: levelPreset.ingredientCount - 1 },
                    }))}
                > <span style={{ fontSize: "24px", lineHeight: "1" }}> - </span></button>
                <input
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
                    }))} />
                <button
                    style={{
                        padding: "0",
                        backgroundColor: "white",
                        fontSize: "0",
                        marginLeft: "5px",
                        border: "none",
                        minWidth: "24px",
                        maxHeight: "24px",
                    }}
                    onClick={() => setLevelPreset(update(levelPreset, {
                        name: { $set: "custom level" },
                        ingredientCount: { $set: levelPreset.ingredientCount + 1 },
                    }))}
                > <span style={{ fontSize: "24px", lineHeight: "1" }}> + </span></button>
            </div>
            <br />
            {/* 
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
            </label><br /> */}
        </div>
    </div>;
}
