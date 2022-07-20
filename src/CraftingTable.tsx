import update from "immutability-helper";
import { atom, selector, useRecoilValue } from 'recoil';
import { Reaction, SubstanceId } from "./crafting";
import * as flex from "./utils/flex";
import * as _ from "lodash";
import { Tube } from "./Tube";
import { CraftingAction, craftingReduce } from './crafting';
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { reactionsLibraryRecoil } from "./ReactionsLibrary";
import { CraftingTargets, craftingTargetsRecoil } from "./CraftingTargets";
import { isWinRecoil } from "./Win";
import { levelPresetRecoil } from "./LevelList";
import { buttonCss } from "./buttonCss";
import { CraftingIngredientButton } from "./CraftingIngredientButton";
import { CraftingTube } from "./CraftingTube";
export type CSSProperties = import("preact").JSX.CSSProperties;

export const craftingActionsRecoil = atom({
    key: "craftingActions",
    default: [] as CraftingAction[],
});

export const appliedCraftingActionsRecoil = selector({
    key: "appliedCraftingActions",
    get: ({ get }) => {
        const actions = get(craftingActionsRecoil);
        const reactions = get(reactionsLibraryRecoil);
        const targets = get(craftingTargetsRecoil);
        let state: ReturnType<typeof craftingReduce> | undefined;
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            state = craftingReduce(
                { reactions },
                action,
                state?.stateFinal
                ?? { tubes: [[]], targets });
        }
        return state ?? {
            stateFinal: {
                tubes: [[] as SubstanceId[]],
                targets,
            }
        };
    }
});

export const tubesState = selector({
    key: "tubes",
    get: ({ get }) => {
        const { stateFinal } = get(appliedCraftingActionsRecoil);
        return stateFinal.tubes;
    }
})



export function CraftingTable() {
    const updCraftingActions = useUpdRecoilState(craftingActionsRecoil);
    const act = (action: CraftingAction) => updCraftingActions({ $push: [action] });

    const tubes = useRecoilValue(tubesState);
    const { ingredientCount } = useRecoilValue(levelPresetRecoil);
    const ingredients = Array.from({ length: ingredientCount }, (_, i) => i);

    const isWin = useRecoilValue(isWinRecoil);

    return <div style={{
        backgroundColor: "#f4fff559",
        padding: "10px",
        ...flex.col,
    }}>

        <div style={{ ...flex.row }}>
            <div style={{ ...flex.row, flex: 1 }}>
                {ingredients
                    .filter((_, i) => !(i > 2))
                    .map(sid => <CraftingIngredientButton sid={sid} />)}
            </div>
            <div style={{ ...flex.rowRev, flex: 1 }}>
                {ingredients
                    .filter((_, i) => (i > 2))
                    .map(sid => <CraftingIngredientButton sid={sid} mirrored />)}
            </div>
        </div>

        <div style={{ ...flex.row }}>
            <div style={{ ...flex.rowRev, flex: 1 }}>
                {tubes.length > 1 && <div style={{ ...flex.col }}>
                    <button
                        className={buttonCss}
                        disabled={isWin || !tubes[1] || tubes[0].length === 0}
                        onClick={() => act({ action: "pourFromMainIntoSecondary" })}
                    >&lt;</button>
                    <button
                        className={buttonCss}
                        disabled={isWin || !tubes[1] || tubes[1].length === 0}
                        onClick={() => act({ action: "pourFromSecondaryIntoMain" })}
                    >&gt;</button>
                </div>}
                {tubes.slice(1).map((t, i) => <Tube tube={t} />)}
            </div>

            <CraftingTube
                tube={tubes[0]}
                style={{
                    flexShrink: 0,
                    margin: "-20px 10px -30px",
                }} />
            <CraftingTargets style={{
                flex: 1,
            }} />
        </div>

        <div>

            <div style={{ ...flex.row, flex: 1 }}>
                <button
                    className={buttonCss}
                    style={{
                        ...flex.row,
                    }}
                    disabled={isWin || tubes.length <= 1}
                    onClick={() => act({ action: "trashTube" })}
                ><div style={{
                    fontSize: "19px",
                    lineHeight: "22px",
                    height: "18px",
                    color: "red",
                }}>x</div><div style={{
                    width: "10px",
                    height: "26px",
                    backgroundColor: "#dddddd",
                    borderRadius: "0px 0px 999px 999px",
                }}></div></button>
                
                <button
                    className={buttonCss}
                    style={{
                        ...flex.row,
                    }}
                    disabled={isWin}
                    onClick={() => act({ action: "addTube" })}
                ><div style={{
                    fontSize: "19px",
                    lineHeight: "22px",
                    height: "18px",
                }}>+</div><div style={{
                    width: "10px",
                    height: "26px",
                    backgroundColor: "#dddddd",
                    borderRadius: "0px 0px 999px 999px",
                }}></div></button>
            </div>

        </div>
    </div>;
}

