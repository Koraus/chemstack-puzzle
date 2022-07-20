import * as _ from "lodash";
import { useRecoilState, useRecoilTransaction_UNSTABLE, useRecoilValue } from 'recoil';
import { css, cx } from "@emotion/css";
import { craftingActionsRecoil, CraftingTable } from "./CraftingTable";
import { isWinRecoil, WinEffect } from "./Win";
import { ReactionsLibrary } from "./ReactionsLibrary";
import { ActionLog } from "./ActionLog";
import { Statistics } from "./Statistics";
import * as flex from "./utils/flex";
import { LevelEditor } from "./LevelEditor";
import { LevelList, levelPresetRecoil, LoadHighestLevelEffect } from "./LevelList";
import { useState, StateUpdater } from "preact/hooks";
import { levelPresets } from "./levelPresets";
import { buttonCss } from "./buttonCss";
type CSSProperties = import("preact").JSX.CSSProperties;


const _css = css`
& {
    max-width: 414px;
    background: linear-gradient(#344763, #081f41);
    margin: auto;
    font-family: 'Bahnschrift', sans-serif;
}
`;

function Header({ 
    style,
    showMenuState: [showMenu, setShowMenu],
}: { 
    style?: CSSProperties,
    showMenuState: [boolean, StateUpdater<boolean>],
}) {
    const reset = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        set(craftingActionsRecoil, []);
    });
    const setLevelPreset = useRecoilTransaction_UNSTABLE(({ get, set }) => (lp: typeof levelPreset) => {
        set(levelPresetRecoil, lp)
        set(craftingActionsRecoil, []);
    });

    const [levelPreset] = useRecoilState(levelPresetRecoil);
    let currentLevelIndex = levelPresets
        .findIndex(lp => lp.name === levelPreset.name);
    if (currentLevelIndex < 0) {
        currentLevelIndex = 0;
    }
    const nextLevelIndex = (currentLevelIndex + 1) % levelPresets.length;
    const setNextLevel = () => setLevelPreset(levelPresets[nextLevelIndex]);

    return <div
        className={css`
            display: flex;
            flex-direction: row;
            margin: 14px 34px 10px 34px;
            & > :nth-child(1), & > :nth-last-child(1) {
                display: block;
                flex: 1;
                color: #f7f7f750;
                font-size: 32px;
                text-decoration: none;
            }
            & > :nth-child(2), & > :nth-last-child(2) {
                flex-grow: 999;
            }
            & > :nth-child(2) button, & > :nth-last-child(2) button {
                width: 30px;
                padding: 0px;
                visibility: hidden;
            }
            & > :nth-child(3) {
                flex-shrink: 0;
                color: #f7f7f7ff;
                font-size: 25px;
                text-transform: uppercase;
            }
        `}
        style={style}
    >
        <a
            class="material-symbols-rounded"
            href="#"
            onClick={() => setShowMenu(!showMenu)}
        >menu</a>

        <div><button className={buttonCss}>&gt;</button></div>
        <div>{useRecoilValue(levelPresetRecoil).name}</div>
        <div><button
            className={buttonCss} 
            style={{
                visibility: useRecoilValue(isWinRecoil) ? "visible" : undefined,
            }}
            onClick={setNextLevel}
        >&gt;</button></div>
        <a
            class="material-symbols-rounded"
            href="#"
            onClick={() => reset()}
        >refresh</a>
    </div>
}

export function App() {
    const [showMenu, setShowMenu] = useState(false);

    return <div className={cx(_css)}>
        <div style={{ ...flex.col }}>
            <Header showMenuState={[showMenu, setShowMenu]} />

            {showMenu &&
                <div style={{
                    ...flex.row,
                    backgroundColor: "#ffffff20",
                }}>
                    <LevelList style={{
                        flex: 2,
                        borderRight: "1px solid #ffffff50"
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
        <WinEffect />
        <LoadHighestLevelEffect />
    </div>
}

