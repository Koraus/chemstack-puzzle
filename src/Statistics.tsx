import { useRecoilValue } from 'recoil';
import { craftingActionsRecoil } from './CraftingTable';
import { levelPresetRecoil } from "./LevelEditor";
import { SubstanceId } from "./crafting";
import { substanceColors } from './substanceColors';
type CSSProperties = import("preact").JSX.CSSProperties;

export function Ingredient({ id: sid }: { id: SubstanceId }) {
    return <div style={{
        fontFamily: "Courier",
        padding: "4px 5px 2px",
        border: "1px solid",
        backgroundColor: substanceColors[sid],
        color: "#ffffffff",
    }}>{sid}</div>;
}


export function Statistics({ style }: { style?: CSSProperties }) {
    const actions = useRecoilValue(craftingActionsRecoil);
    return <div style={{
        marginTop: "20px",
        backgroundColor: "#ffffff20",
        color: "white",
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
                Action count: {actions.length}
            </div>
            <div>
                Ingredients used:
                {Object.entries(
                    actions
                        .reduce(
                            (acc, a) => {
                                if (a.action !== "addIngredient") { return acc; }
                                return a
                                    ? { ...acc, [a.ingredientId]: (acc[a.ingredientId] ?? 0) + 1 }
                                    : acc;
                            },
                            {} as Record<SubstanceId, number>)
                ).map(([id, count]) => <div style={{
                    display: "flex",
                    flexDirection: "row-reverse",
                }}>
                    <Ingredient id={Number(id)} />{count}&nbsp;x&nbsp;
                </div>)}
            </div>
            <div>
                Max tubes in use: TBD
            </div>
        </div>
    </div>;
}
