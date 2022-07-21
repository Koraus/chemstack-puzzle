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
        padding: "8px 10px",
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

        <div style={{
            ...flex.row,
            marginTop: 10,
        }}>
            <div style={{
                ...flex.rowRev,
                position: "relative",
                perspective: "120px",
                transformStyle: "preserve-3d",
                flex: 1,
            }}>
                {tubes.slice(1).map((t, i) => {
                    if (i === 0) { return <Tube tube={t} />; }
                    const dx = (i - 1) * 23 + 15;
                    const dz = Math.pow((i - 1), 0.4) * 20 + 40;
                    return <Tube
                        style={{
                            position: "absolute",
                            transform: `translate3d(${-dx}px, 0, ${-dz}px)`,
                        }}
                        shadow={0.47}
                        tube={t} />;
                })}
            </div>

            <div
                style={{
                    ...flex.row,
                    flexShrink: 0,
                    margin: "-55px 0px -18px",
                }}>

                <div style={{
                    ...flex.col,
                    visibility: tubes.length > 1 ? undefined : "hidden",
                    margin: "50px 10px 50px 10px"
                }}>
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
                </div>

                <CraftingTube
                    tube={tubes[0]} />

                <div style={{
                    ...flex.col,
                    visibility: "hidden",
                    margin: "50px 10px 50px 10px"
                }}>
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
                </div>


            </div>
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

