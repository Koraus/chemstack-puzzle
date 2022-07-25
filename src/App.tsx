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
import { Github } from '@emotion-icons/bootstrap/Github';
import { OpenInNew } from '@emotion-icons/material-rounded/OpenInNew';


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
                <ActionLog style={{ flex: 1 }} />
                {/* <Statistics style={{ flex: 1 }} /> */}
            </div>

            <div style={{
                ...flex.row,
                justifyContent: "center",
                padding: "8px 14px",
                marginTop: 20,
                backgroundColor: "#ffffff20",
            }}>
                <a 
                    style={{
                        flex: 1,
                        color: "white",
                        fontSize: "24px",
                        textAlign: "left",
                    }}
                    target="_blank"
                    href="https://www.gkzr.me"
                >
                    <OpenInNew style={{height: 20, marginRight: 5}} />
                    GKZR</a>
                <a 
                    style={{
                        flex: 1,
                        display: "block",
                        fontSize: "18px",
                        lineHeight: "28px",
                        color: "white",
                        textAlign: "right",
                    }}
                    target="_blank"
                    href="https://github.com/ndry/chemstack-puzzle"
                >
                    chemstack-puzzle
                    <Github style={{height: 20, marginLeft: 5 }} /></a>
            </div>
        </div>
        <WinEffect />
        <LoadHighestLevelEffect />
    </div>
}

