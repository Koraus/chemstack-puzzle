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
import { useWindowSize } from "./utils/useWindowSize";

export function App() {
    const windowSize = useWindowSize();
    const isHorizontal = (windowSize?.innerWidth ?? 0) > 900;

    const main = useMemo(() => <>
        <ReactionsLibrary />
        <CraftingTable />
    </>, []);

    return <div className={cx(css`& {
        max-width: ${isHorizontal ? 900 : 414}px;
        background: linear-gradient(#344763, #081f41);
        margin: auto;
        font-family: 'Bahnschrift', sans-serif;
    }`)}>
        {isHorizontal && <div className={cx(flex.row)}>
            <div className={cx(flex.col)} style={{ flex: 1 }}>
                <div className={cx(flex.row, css`& { padding: 14px 0 10px 0; }`)} >
                    <LevelListHeaderButton className={css`& { flex: 1; }`} />
                    <HeaderTitle isHorizontal className={css`& { flex-grow: 999; }`} />
                </div>
            </div>

            <div className={cx(flex.col, css`& {width: 414px}`)}>{main}</div>

            <div style={{ flex: 1, ...flex.colS }}>
                <div className={cx(flex.rowRev, css`& { padding: 14px 0 10px 0; }`)} >
                    <ResetLevelHeaderButton className={css`& { flex: 1; }`} />
                    <div className={cx(css`& { flex-grow: 999; }`)}></div>
                </div>
                <div className={cx(css`& { flex-grow: 999; }`)}></div>
                <Footer isHorizontal />
            </div>
        </div>}

        {!isHorizontal && <div className={cx(flex.col)}>
            <div className={cx(flex.row, css`& { padding: 14px 0 10px 0; }`)} >
                <LevelListHeaderButton className={css`& { flex: 1; }`} />
                <HeaderTitle className={css`& { flex-grow: 999; }`} />
                <ResetLevelHeaderButton className={css`& { flex: 1; }`} />
            </div>

            {main}

            <Footer />
        </div>}

        <WinEffect />
        <LoadHighestLevelEffect />
    </div>
}
