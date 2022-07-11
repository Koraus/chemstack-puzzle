import { useRecoilValue } from 'recoil';
import { tubesAtom } from "./CraftingTable";
import * as flex from './utils/flex';
import { levelState } from './LevelConfigEditor';
import { substanceColors } from './substanceColors';
type CSSProperties = import("preact").JSX.CSSProperties;

export function ReactionsLibrary({ style }: { style?: CSSProperties }) {
    const tube = useRecoilValue(tubesAtom)[0];
    const currentSubstance = tube[tube.length - 1];
    const { reactions } = useRecoilValue(levelState);

    function Attention({isApplicable}: {isApplicable: boolean}) {
        return <div style={{ color: "#ffffffff" }}>
            {isApplicable ? <> 	&#x2022;</> : <>&nbsp;</>}
        </div>;
    }
    function IngredientSlot({ sid }: { sid?: number }) {
        return <div style={{
            backgroundColor: sid === undefined ? "#ffffff08" : substanceColors[sid],
            color: sid === undefined ? "#ffffff10" : "#ffffffff",
            borderRadius: "3px",
            margin: "1px",
            width: "18px",
            height: "18px",
            fontSize: "14px",
            fontFamily: "Bahnschrift",
            lineHeight: "20px",
        }}>{sid ?? <>&nbsp;</>}</div>
    }

    return <div style={{
        ...flex.row,
        justifyContent: "center",
        ...style,
    }}>
        {reactions.map(r => {
            const isApplicable = currentSubstance === r.reagents[0];
            return <div style={{
                ...flex.col,
                textAlign: "center",
            }}>
                <Attention isApplicable={isApplicable} />
                <IngredientSlot sid={r.products[2]} />
                <IngredientSlot sid={r.products[1]} />
                <IngredientSlot sid={r.products[0]} />
                <div style={{
                    color: "#ffffff30",
                    fontSize: "18px",
                    fontFamily: "Bahnschrift",
                    height: "20px",
                    lineHeight: "32px",
                }}>
                    &#8963;
                </div>
                <IngredientSlot sid={r.reagents[1]} />
                <IngredientSlot sid={r.reagents[0]} />
                <Attention isApplicable={isApplicable} />
            </div>;
        })}
    </div>;
}
