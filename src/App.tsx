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
import { useState, useEffect } from 'preact/hooks';
import { WinFireworks } from "./WinFireworks";

export function App() {
    const [isLandscape, setIsLandscape] = useState(false);
    useEffect(() => {
        const upd = () => setIsLandscape(window.matchMedia("(orientation: landscape)").matches);
        upd();
        window.addEventListener('resize', upd);
        return () => window.removeEventListener('resize', upd);
    }, []);
    
    const main = useMemo(() => <>
        <ReactionsLibrary />
        <CraftingTable />
    </>, []);

    return <div className={cx(css`& {
        max-width: ${isLandscape ? 922 : 414}px;
        background: linear-gradient(#344763, #081f41);
        margin: auto;
        font-family: 'Bahnschrift', sans-serif;
        position: relative;
    }`)}>
        <WinFireworks className={cx(css`& {
            overflow: hidden;
            position: absolute;
            top: 0px;
            bottom: 0px;
            right: 0px;
            left: 0px;
            z-index: 2;
        }`)} />

        {isLandscape && <div className={cx(flex.row)}>
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

        {!isLandscape && <div className={cx(flex.col)}>
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
