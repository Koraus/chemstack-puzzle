import { useRecoilValue } from 'recoil';
import { tubesState } from "./CraftingTable";
import * as flex from './utils/flex';
import { levelState } from './LevelEditor';
import { substanceColors } from './substanceColors';
type CSSProperties = import("preact").JSX.CSSProperties;

export function ReactionsLibrary({ style }: { style?: CSSProperties }) {
    const tube = useRecoilValue(tubesState)[0];
    const currentSubstance = tube[tube.length - 1];
    const { reactions } = useRecoilValue(levelState);

    function IngredientSlot({ sid }: { sid?: number }) {
        return <div style={{
            backgroundColor: sid === undefined ? "#ffffff08" : substanceColors[sid],
            color: sid === undefined ? "#ffffff10" : "#ffffffff",
            borderRadius: "3px",
            margin: "1px",
            width: "18px",
            height: "18px",
            fontSize: "14px",
            lineHeight: "20px",
        }}>{sid ?? <>&nbsp;</>}</div>
    }

    return <div style={{
        ...flex.row,
        justifyContent: "center",
        padding: "24px 0px 20px",
        ...style,
    }}>
        {reactions.map(r => {
            const isApplicable = currentSubstance === r.reagents[0];
            return <div style={{
                position: "relative",
            }}>
                <div style={{
                    ...flex.col,
                    textAlign: "center",
                }}>
                    <IngredientSlot sid={r.products[2]} />
                    <IngredientSlot sid={r.products[1]} />
                    <IngredientSlot sid={r.products[0]} />
                    <div
                        class="material-symbols-rounded"
                        style={{
                            color: isApplicable ? "white" : "#ffffff30",
                            fontSize: "19px",
                            height: "18px",
                        }}
                    >keyboard_arrow_up</div>
                    <IngredientSlot sid={r.reagents[1]} />
                    <IngredientSlot sid={r.reagents[0]} />
                </div>
                {isApplicable && <div style={{
                    zIndex: 1,
                    position: "absolute",
                    top: "1px",
                    left: "1px",
                    bottom: "1px",
                    right: "1px",
                    border: "2px solid white",
                    borderRadius: "3px",
                }}></div>}
            </div>;
        })}
    </div>;
}
