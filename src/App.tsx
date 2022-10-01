import "./initAnalytics";

import { css, cx } from "@emotion/css";
import { CraftingTable } from "./CraftingTable";
import { WinEffect } from "./Win";
import { ReactionsLibrary } from "./ReactionsLibrary";
import * as flex from "./utils/flex";
import { LoadHighestLevelEffect } from "./LevelList";
import { LevelListHeaderButton } from './LevelListHeaderButton';
import { ResetLevelHeaderButton } from './ResetLevelHeaderButton';
import { HeaderTitle } from './HeaderTitle';
import { Footer } from "./Footer";
import { useMemo } from "preact/hooks";
import { WinFireworks } from "./WinFireworks";
import { Statistics } from "./Statistics";
import { landscapeWidth, portraitWidth, useIsLandscapeValue, useOrientationEffect } from "./orientation";
import { appVersion } from "./appVersion";

export function App() {
    useOrientationEffect();
    const isLandscape = useIsLandscapeValue();
    const main = useMemo(() => <>
        <ReactionsLibrary />
        <CraftingTable />
    </>, []);

    const version = <div className={css({
        color: "#ffffff24", 
        whiteSpace: "nowrap",
        textAlign: isLandscape ? "left" : "center",
    })}>
        <span className={css({ fontSize: "16px", })} >{appVersion.split("+")[0]}</span>
        <span className={css({ fontSize: "10px", })} >+{appVersion.split("+")[1]}</span>
    </div>;

    return <div className={cx(
        css`& {
            font-family: 'Bahnschrift', sans-serif;
            display: flex;
            position: fixed;
            inset: 0;
            overflow: auto;
        }
        `,
        css`&::-webkit-scrollbar { height: 0px; }`
    )}>
        <div className={cx(css`& {
            flex-grow: 1;
            max-width: ${isLandscape ? landscapeWidth : portraitWidth}px;
            position: relative;
            margin: auto;
        }`)}>
            <WinFireworks className={cx(css`& {
                overflow: hidden;
                position: absolute;
                inset: 0;
                z-index: 2;
            }`)} />

            {isLandscape && <div className={cx(flex.row)}>
                <div className={cx(
                    css`& { width: ${(1 - portraitWidth / landscapeWidth) / 2 * 100}%; }`,
                    flex.col,
                )}>
                    <div className={cx(flex.row, css`& { flex-grow: 999; padding: 14px 0 10px 0; }`)} >
                        <LevelListHeaderButton className={css`& { flex: 1; }`} />
                        <HeaderTitle isHorizontal className={css`& { flex-grow: 999; }`} />
                    </div>
                    {version}
                </div>

                <div className={cx(
                    css`& { width: ${portraitWidth / landscapeWidth * 100}%; }`,
                    flex.col,
                )}>{main}</div>

                <div className={cx(
                    css`& { width: ${(1 - portraitWidth / landscapeWidth) / 2 * 100}%; }`,
                    flex.col,
                )}>
                    <div className={cx(flex.rowRev, css`& { padding: 14px 0 10px 0; }`)} >
                        <ResetLevelHeaderButton className={css`& { flex: 1; }`} />
                        <div className={cx(css`& { flex-grow: 999; }`)}></div>
                    </div>
                    <Statistics isHorizontal />
                    <div className={cx(css`& { flex-grow: 999; }`)}></div>
                    <Footer isHorizontal />
                </div>
            </div>}

            {!isLandscape && <div className={cx(flex.col)}>
                <div className={cx(flex.row, css`& { padding: 14px 0 10px 0; }`)} >
                    <LevelListHeaderButton className={css`& { flex: 1; }`} />
                    <HeaderTitle className={css`& { flex-grow: 999; }`} />
                    <ResetLevelHeaderButton className={css`& { flex: 1; }`} />
                </div>

                {main}

                <Statistics />

                <Footer />

                {version}
            </div>}

            <WinEffect />
            <LoadHighestLevelEffect />
        </div>
    </div>
}
