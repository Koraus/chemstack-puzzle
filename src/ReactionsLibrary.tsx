import { useRecoilValue } from 'recoil';
import { tubesAtom, IngredientSlot } from "./CraftingTable";
import { reactions } from "./staticConfig";


export function ReactionsLibrary() {
    const tube = useRecoilValue(tubesAtom)[0];
    const currentSubstance = tube[tube.length - 1];
    return <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
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
