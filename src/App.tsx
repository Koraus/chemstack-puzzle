import * as _ from "lodash";
import { useRecoilValue } from 'recoil';
import { css, cx } from "@emotion/css";
import { CraftingTable, tubesAtom } from "./CraftingTable";
import { ReactionsLibrary } from "./ReactionsLibrary";
import { ActionLog } from "./ActionLog";
import { Statistics } from "./Statistics";
import * as flex from "./utils/flex";
import { LevelConfigEditor, levelState } from "./LevelConfigEditor";

const _css = css`
    & {
        min-width: 100%;
        min-height: 100%;
        background: linear-gradient(#344763, #081f41);
    }
    &.isWin {
        background-color: hsl(120, 100%, 90%);
    }
    &>* {
        margin: auto;
    }
    &>*>* {
        flex: 1;
    }
    & button { 
        font-size: 100%
    }
`;

export function App() {
    const tubes = useRecoilValue(tubesAtom);
    const { target } = useRecoilValue(levelState);

    const isWin =
        tubes[0].length === target.length
        && tubes[0].every((_, i) => tubes[0][i] === target[i]);

    return <div className={cx(_css, { isWin })}>
        <div style={{ ...flex.col }}>
            <div style={{
                ...flex.row,
                margin: "10px 30px 0 30px",
                textAlign: "center",
                fontFamily: "Bahnschrift",
            }}>
                <div style={{
                    color: "#f7f7f750",
                    fontSize: "30px",
                    lineHeight: "28px",
                }}>&#9776;</div>
                <div style={{
                    flexGrow: "1", 
                    color: "#f7f7f7ff",
                    fontSize: "24px",
                }}>LEVEL 01</div>
                <div style={{
                    color: "#f7f7f750",
                    fontSize: "30px",
                    lineHeight: "28px",
                }}>&#10227;</div>
            </div>

            <ReactionsLibrary />
            <CraftingTable />
            
            {isWin && <button>Next Level &gt;</button>}

            <div style={{ ...flex.row }}>
                <ActionLog style={{ flex: 3 }} />
                <Statistics style={{ flex: 2 }} />
            </div>


            <LevelConfigEditor />

        </div>
    </div>
}


