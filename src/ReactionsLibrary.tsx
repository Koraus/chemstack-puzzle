import { useRecoilValue } from 'recoil';
import { tubesAtom, IngredientSlot } from "./CraftingTable";
import * as flex from './utils/flex';
import { levelState } from './LevelConfigEditor';
type CSSProperties = import("preact").JSX.CSSProperties;


export function ReactionsLibrary({ style }: { style?: CSSProperties }) {
    const tube = useRecoilValue(tubesAtom)[0];
    const currentSubstance = tube[tube.length - 1];
    const { reactions } = useRecoilValue(levelState);

    return <div style={{
        ...flex.row,
        flexDirection: "row",
        justifyContent: "center",
        ...style,
    }}>
        {reactions.map(r => {
            const isApplicable = currentSubstance === r.reagents[0];
            return <div style={{
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
            }}>
                {isApplicable ? "*" : <>&nbsp;</>}
                <IngredientSlot ingrId={r.products[2]} />
                <IngredientSlot ingrId={r.products[1]} />
                <IngredientSlot ingrId={r.products[0]} />
                &uArr;
                <IngredientSlot ingrId={r.reagents[1]} />
                <IngredientSlot ingrId={r.reagents[0]} />
                {isApplicable ? "*" : <>&nbsp;</>}
            </div>;
        })}
    </div>;
}
