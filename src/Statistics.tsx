import { useRecoilValue } from 'recoil';
import { actionsAtom } from './ActionLog';
import { levelState, SubstanceId } from "./LevelConfigEditor";
type CSSProperties = import("preact").JSX.CSSProperties;

export function Ingredient({ id }: { id: SubstanceId }) {
    const { substances } = useRecoilValue(levelState);
    const hue = id / substances.length * 360;
    return <div style={{
        fontFamily: "Courier",
        padding: "4px 5px 2px",
        border: "1px solid",
        backgroundColor: `hsl(${hue}, 100%, 80%)`,
        color: `hsl(${hue}, 100%, 30%)`,
    }}>{id}</div>;
}


export function Statistics({ style }: { style?: CSSProperties }) {
    const actions = useRecoilValue(actionsAtom);
    return <div style={{
        marginTop: "20px",
        backgroundColor: "#ffffff20",
        color: "white",
        fontFamily: "Bahnschrift",
        ...style,
    }}>
        <h3 style={{
            margin: "0px",
            backgroundColor: "#ffffff50",
            paddingLeft: "20px",
        }}>&#x2022; Statistics:</h3>
        <div style={{
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingBottom: "20px",
        }}>
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
        </div>
    </div>;
}
