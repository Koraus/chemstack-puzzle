import { useRecoilValue } from 'recoil';
import update from "immutability-helper";
import { solutionRecoil, useSetProblem } from './solutionRecoil';
import { buttonCss } from './buttonCss';
import { cx, css } from '@emotion/css';
import { Add } from '@emotion-icons/material-rounded/Add';
import { Remove } from '@emotion-icons/material-rounded/Remove';
import * as flex from "./utils/flex";
import { Dice } from '@emotion-icons/ionicons-outline/Dice';


type CSSProperties = import("preact").JSX.CSSProperties;

function NumberInput({ value, onValueChange }: {
    value: number,
    onValueChange: (value: number) => void,
}) {
    const buttonCss1 = css`& {
        width: 24px;
        line-height: 0;
    }`;
    return <div style={{
        display: "flex",
        alignItems: "center"
    }}>
        <button
            className={cx(buttonCss, buttonCss1)}
            onClick={() => onValueChange(value - 1)}
        ><Remove style={{ margin: -6 }} /></button>
        <span style={{
            margin: "0px 5px",
        }}>{value}</span>
        <button
            className={cx(buttonCss, buttonCss1)}
            onClick={() => onValueChange(value + 1)}
        ><Add style={{ margin: -6 }} /></button>
    </div>
}

export function LevelEditor({ style }: { style?: CSSProperties }) {
    const levelPreset = useRecoilValue(solutionRecoil).problem;
    const setLevelPreset = useSetProblem();

    return <div style={{
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

            <div style={{
                display: "flex",
                justifyContent: 'space-around',
                marginTop: "10px",

            }}>
                <div style={
                    {
                        marginBottom: "4px",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                    }}>

                    <div style={
                        {
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column",
                        }
                    } >
                        Seed
                        <div style={{
                            display: "flex",
                            alignItems: "center",

                        }}>
                            <button
                                className={buttonCss}
                                style={{
                                    padding: "0",
                                    fontSize: "0",
                                    marginLeft: "5px",
                                    width: "26px",
                                    height: "26px"
                                }}

                                onClick={() => {
                                    const newSeed = Math.round(Math.random() * 10000).toString();
                                    setLevelPreset(update(levelPreset, {
                                        seed: { $set: newSeed },
                                        name: { $set: "custom level" },
                                    }));
                                }}

                            >   <Dice style={{color:"#283C5A", width:"80%"}}> </Dice>
                                 </button>
                            <input
                                style={{

                                    width: "50px",
                                }}
                                value={levelPreset.seed}
                                onChange={ev => setLevelPreset(update(levelPreset, {
                                    name: { $set: "custom level" },
                                    seed: { $set: (ev.target as HTMLInputElement).value },
                                }))} />
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            marginBottom: "4px",
                            alignItems: "center",
                            flexDirection: "column",
                        }}
                    >Substances
                        <NumberInput
                            value={levelPreset.substanceCount}
                            onValueChange={v => setLevelPreset(update(levelPreset, {
                                name: { $set: "custom level" },
                                substanceCount: { $set: v },
                            }))}
                        />
                    </div>

                </div>
                <div style={{ ...flex.colS }}>
                    <div style={{ ...flex.colS, alignItems: "center" }}>
                        Max Substances
                        <NumberInput
                            value={levelPreset.substanceMaxCount}
                            onValueChange={v => setLevelPreset(update(levelPreset, {
                                name: { $set: "custom level" },
                                substanceMaxCount: { $set: v },
                            }))}
                        />
                    </div>



                    <div style={{
                        display: "inline-flex",
                        marginBottom: "4px",
                        alignItems: "center",
                        flexDirection: "column",
                    }}>Ingredients
                        <NumberInput
                            value={levelPreset.ingredientCount}
                            onValueChange={v => setLevelPreset(update(levelPreset, {
                                name: { $set: "custom level" },
                                ingredientCount: { $set: v },
                            }))}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>;
}
