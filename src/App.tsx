import * as _ from "lodash";
import { css, cx } from "@emotion/css";
import { CraftingTable } from "./CraftingTable";
import { WinEffect } from "./Win";
import { ReactionsLibrary } from "./ReactionsLibrary";
import { ActionLog } from "./ActionLog";
import { Statistics } from "./Statistics";
import * as flex from "./utils/flex";
import { LevelEditor } from "./LevelEditor";
import { LevelList, LoadHighestLevelEffect } from "./LevelList";
import { useState } from "preact/hooks";
import { Header } from "./Header";


const _css = css`
& {
    max-width: 414px;
    background: linear-gradient(#344763, #081f41);
    margin: auto;
    font-family: 'Bahnschrift', sans-serif;
}
`;

export function App() {
    const [showMenu, setShowMenu] = useState(false);

    return <div className={cx(_css)}>
        <div style={{ ...flex.col }}>
            <Header
                className={css`
                    & {
                        margin: 14px 34px 10px 34px;
                    }
                `}
                showMenuState={[showMenu, setShowMenu]}
            />
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

