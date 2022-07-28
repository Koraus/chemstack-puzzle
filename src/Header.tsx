import { useRecoilState, useRecoilTransaction_UNSTABLE, useRecoilValue } from 'recoil';
import { css, cx } from "@emotion/css";
import { craftingActionsRecoil } from "./CraftingTable";
import { isWinRecoil } from "./Win";
import { levelPresetRecoil } from "./LevelList";
import { StateUpdater } from "preact/hooks";
import { levelPresets } from "./levelPresets";
import { buttonCss } from "./buttonCss";
import { JSX } from "preact";
import { Menu } from '@emotion-icons/material-rounded/Menu';
import { Refresh } from '@emotion-icons/material-rounded/Refresh';


export function Header({
    style, showMenuState: [showMenu, setShowMenu], className
}: {
    className?: string,
    style?: JSX.CSSProperties;
    showMenuState: [boolean, StateUpdater<boolean>];
}) {
    const reset = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        set(craftingActionsRecoil, []);
    });
    const setLevelPreset = useRecoilTransaction_UNSTABLE(({ get, set }) => (lp: typeof levelPreset) => {
        set(levelPresetRecoil, lp);
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
        className={cx(css`
            display: flex;
            flex-direction: row;
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
        `, className)}
        style={style}
    >
        <a
            style={{ fontSize: "0"}}
            href="#"
            onClick={() => setShowMenu(!showMenu)}
        > <Menu style={{ height: "32px" }} />
        </a>


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
            style={{ fontSize: "0"}}
            href="#"
            onClick={() => reset()}
        > <Refresh style={{ height: "32px" }} />
        </a>
    </div>;
}
