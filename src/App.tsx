import * as _ from "lodash";
import { useRecoilState, useRecoilTransaction_UNSTABLE, useRecoilValue } from 'recoil';
import { css, cx } from "@emotion/css";
import { CraftingTable, tubesState } from "./CraftingTable";
import { ReactionsLibrary } from "./ReactionsLibrary";
import { ActionLog, actionsState } from "./ActionLog";
import { Statistics } from "./Statistics";
import * as flex from "./utils/flex";
import { LevelEditor, LevelList, levelPresets, levelPresetState, levelState } from "./LevelEditor";
import { useState } from "preact/hooks";

const _css = css`
    & {
        max-width: 500px;
        background: linear-gradient(#344763, #081f41);
        margin: auto;
    }
    & * {
        font-family: 'Bahnschrift', sans-serif;
    }
    & button {
        font-size: 100%;

        background-color: #ffffffff;
        border: none;
        border-radius: 4px;
        margin: 5px;
        padding: 5px;
    }
    & button:disabled {
        background-color: #ffffff90;
    }
`;

export function App() {
    const tubes = useRecoilValue(tubesState);
    const [levelPreset] = useRecoilState(levelPresetState);
    const { target } = useRecoilValue(levelState);
    const [showMenu, setShowMenu] = useState(false);

    const reset = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        set(tubesState, [[]]);
        set(actionsState, []);
    });
    const setLevelPreset = useRecoilTransaction_UNSTABLE(({ get, set }) => (lp: typeof levelPreset) => {
        set(levelPresetState, lp)
        set(tubesState, [[]]);
        set(actionsState, []);
    });

    const isWin =
        tubes[0].length === target.length
        && tubes[0].every((_, i) => tubes[0][i] === target[i]);

    return <div className={cx(_css, { isWin })}>
        <div style={{ ...flex.col }}>
            <div style={{
                ...flex.row,
                margin: "10px 30px 0 30px",
                textAlign: "center",
            }}>
                <a
                    style={{
                        display: "block",
                        color: "#f7f7f750",
                        fontSize: "30px",
                        lineHeight: "28px",
                        textDecoration: "none",
                    }}
                    href="#"
                    onClick={() => setShowMenu(!showMenu)}
                >&#9776;</a>

                <div style={{
                    flex: 1,
                    color: "#f7f7f7ff",
                    fontSize: "24px",
                    textTransform: "uppercase",
                }}>
                    <button
                        style={{
                            width: "30px",
                            padding: "0px",
                            visibility: "hidden",
                        }}
                    >&gt;</button>
                    {useRecoilValue(levelState).name}
                    <button
                        style={{
                            width: "30px",
                            padding: "0px",
                            visibility: isWin ? "visible" : "hidden",
                        }}
                        onClick={() => {
                            let currentLevelIndex = levelPresets
                                .findIndex(lp => lp.name === levelPreset.name);
                            if (currentLevelIndex < 0) {
                                currentLevelIndex = 0;
                            }
                            const nextLevelIndex = (currentLevelIndex + 1) % levelPresets.length;
                            setLevelPreset(levelPresets[nextLevelIndex]);
                        }}
                    >&gt;</button>
                </div>
                <a
                    style={{
                        display: "block",
                        color: "#f7f7f750",
                        fontSize: "30px",
                        lineHeight: "28px",
                        textDecoration: "none",
                    }}
                    href="#"
                    onClick={() => reset()}
                >&#10227;</a>
            </div>
            {showMenu &&
                <div style={{
                    ...flex.row,
                }}>
                    <LevelList style={{
                        flex: 2,
                    }} />
                    <LevelEditor style={{
                        flex: 5,
                    }} />
                </div>
            }

            <ReactionsLibrary />
            <CraftingTable />


            <div style={{ ...flex.row }}>
                <ActionLog style={{ flex: 3 }} />
                <Statistics style={{ flex: 2 }} />
            </div>



        </div>
    </div>
}

