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
        background-color: hsl(0, 0%, 95%);
    }
    &.isWin {
        background-color: hsl(120, 100%, 90%);
    }
    &>* {
        width: 400px;
        margin: auto;
    }
    &>*>* {
        padding: 10px;
        flex: 1;
        border: 1px solid lightgray;
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
        <div style={{ ...flex.column }}>

            <ReactionsLibrary />
            <CraftingTable />

            <div style={{ ...flex.row }}>
                <ActionLog style={{ flex: 2 }} />
                <Statistics style={{ flex: 1 }} />
            </div>

            {isWin && <button>Next Level &gt;</button>}

            <LevelConfigEditor />

        </div>
    </div>
}


