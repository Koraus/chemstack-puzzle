import { useRecoilValue } from 'recoil';
import { actionsAtom } from './ActionLog';
import { Ingredient } from "./CraftingTable";
import { SubstanceId } from "./LevelConfigEditor";
type CSSProperties = import("preact").JSX.CSSProperties;


export function Statistics({ style }: { style?: CSSProperties }) {
    const actions = useRecoilValue(actionsAtom);
    return <div style={style}>
        <h3 style={{ marginBottom: "0px" }}>Statistics:</h3>
        <div>
            Action count: {actions.filter(a => a.match(/^action/)).length}
        </div>
        <div>
            Ingredients used:
            {Object.entries(
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
            </div>)}
        </div>
    </div>;
}
