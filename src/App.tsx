import * as _ from "lodash";
import { useRecoilValue } from 'recoil';
import { css, cx } from "@emotion/css";
import { useState } from "preact/hooks";
import { CraftingTable, Ingredient, tubesAtom } from "./CraftingTable";
import { actionsAtom } from "./actionsAtom";
import { reactions, SubstanceId, target } from "./staticConfig";

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
        display: flex;
        max-width: 500px;
        min-width: 400px;
        margin: auto;
    }
    &>*>* {
        padding: 10px;
        flex: 1;
    }
    & button { 
        font-size: 100%
    }
`;

export function App() {
    const tubes = useRecoilValue(tubesAtom);
    const actions = useRecoilValue(actionsAtom);

    const isWin =
        tubes[0].length === target.length
        && tubes[0].every((_, i) => tubes[0][i] === target[i]);

    return <div className={cx(_css, { isWin })}>
        <div>
            <div style={{
                textAlign: "right",
            }}>
                <CraftingTable />

                <h3 style={{ marginBottom: "0px" }}>Action log:</h3>
                {[...actions].reverse().slice(0, 5).map(a => <>{a}<br /></>)}
                {(actions.length > 5) && <>{
                    (() => {
                        const [x, sx] = useState(false);
                        return <>
                            {x && [...actions].reverse().slice(5).map(a => <>{a}<br /></>)}
                            <button onClick={() => sx(!x)}>{x ? "/\\" : `... (${actions.length - 5})`}</button><br />
                        </>;
                    })()
                }</>}

                <h3 style={{ marginBottom: "0px" }}>Statistics:</h3>
                <div>
                    Action count: {actions.filter(a => a.match(/^action/)).length}
                </div>
                <div>
                    Ingredients used:
                    {
                        Object.entries(
                            actions
                                .map(a => a.match(/^action: added (.*)/))
                                .reduce(
                                    (acc, m) => m
                                        ? { ...acc, [m[1]]: (acc[Number(m[1])] ?? 0) + 1 }
                                        : acc,
                                    {} as Record<SubstanceId, number>)
                        ).map(([id, count]) => <div style={{
                            display: "flex",
                            flexDirection: "row-reverse",
                        }}>
                            <Ingredient id={Number(id)} />{count}&nbsp;x&nbsp;
                        </div>)
                    }
                </div>
            </div>

            <div>
                {reactions.map(r => <div style={{
                    display: "flex",
                }}>
                    {r.reagents.map(ingrId => <Ingredient id={ingrId} />)}
                    &rArr;
                    {r.products.map(ingrId => <Ingredient id={ingrId} />)}
                </div>)}
            </div>

        </div>
    </div>
}

