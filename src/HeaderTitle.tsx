import { useRecoilState, useRecoilTransaction_UNSTABLE, useRecoilValue } from 'recoil';
import { css, cx } from "@emotion/css";
import { isWinRecoil } from "./Win";
import { levelPresetRecoil } from "./LevelList";
import { levelPresets } from "./levelPresets";
import { buttonCss } from "./buttonCss";
import { JSX } from "preact";
import { craftingActionsRecoil } from './craftingActionsRecoil';
import { ArrowRight } from "@emotion-icons/material-rounded/ArrowRight";


export function HeaderTitle({
    isHorizontal, className, ...props
}: {
    isHorizontal?: boolean;
    className?: string;
    style?: JSX.CSSProperties;
}) {
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

    const isWin = useRecoilValue(isWinRecoil);

    return <div {...props} className={cx(css`& {
        display: flex;
        flex: row;
    }`, className)}>
        {isHorizontal ?? <div className={css`& { flex-grow: 1; }`}>
            <button
                className={cx(
                    buttonCss,
                    css`& {
                        margin: 0 5px;
                        padding: 0px;
                        width: 30px;
                        visibility: hidden;
                    }`
                )}
                onClick={setNextLevel}
            ><ArrowRight className={css`$ { height: 100%; }`} /></button>
        </div>}
        <div className={css`& {
            color: #f7f7f7;
            font-size: 25px;
            text-transform: uppercase;
            text-align: ${isHorizontal ? "left" : "center"};
        }`}>{useRecoilValue(levelPresetRecoil).name}</div>
        <div className={css`& { flex-grow: 1; }`}>
            <button
                className={cx(
                    buttonCss,
                    css`& {
                        margin: 0 5px;
                        padding: 0px;
                        width: 30px;
                        visibility: hidden;
                    }`,
                    isWin && css`& {
                        visibility: visible;
                    }`
                )}
                onClick={setNextLevel}
            ><ArrowRight className={css`$ { height: 100%; }`} /></button>
        </div>
    </div>;
}
