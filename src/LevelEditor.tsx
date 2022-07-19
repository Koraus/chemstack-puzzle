import { useRecoilTransaction_UNSTABLE, useRecoilValue } from 'recoil';
import update from "immutability-helper";
import { craftingActionsRecoil } from './CraftingTable';
import { levelPresetRecoil } from './LevelList';
type CSSProperties = import("preact").JSX.CSSProperties;

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
                    style={{
                        padding: "0",
                        backgroundColor: "white",
                        fontSize: "0",
                        marginLeft:"5px",
                    }}

                    onClick={() => {
                        const newSeed = Math.round(Math.random() * 10000).toString();
                        setLevelPreset(update(levelPreset, {
                            seed: { $set: newSeed },
                            name: { $set: "custom level" },
                        }));
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
