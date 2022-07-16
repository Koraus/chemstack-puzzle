import { css } from "@emotion/css";
import update from "immutability-helper";
import { atom, selector, useRecoilValue } from 'recoil';
import { Reaction, SubstanceId } from "./crafting";
import { substanceColors } from "./substanceColors";
import * as flex from "./utils/flex";
import * as _ from "lodash";
import { Tube } from "./Tube";
import { CraftingAction, craftingReduce } from './crafting';
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { reactionsLibraryRecoil } from "./ReactionsLibrary";
import { CraftingTargets, craftingTargetsRecoil } from "./CraftingTargets";
import { isWinRecoil } from "./Win";
import { levelPresetRecoil } from "./LevelEditor";
type CSSProperties = import("preact").JSX.CSSProperties;

export const craftingActionsRecoil = atom({
    key: "craftingActions",
    default: [] as CraftingAction[],
});

export const appliedCraftingActionsRecoil = selector({
    key: "appliedCraftingActions",
    get: ({ get }) => {
        const actions = get(craftingActionsRecoil);
        const reactions = get(reactionsLibraryRecoil);
        let state: ReturnType<typeof craftingReduce> | undefined;
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            state = craftingReduce(
                { reactions }, 
                action, 
                state?.stateAfterCleanups 
                    ?? { tubes: [[]] });
        }
        return state ?? {
            stateAfterCleanups: {
                tubes: [[] as SubstanceId[]],
            }
        };
    }
});

export const tubesState = selector({
    key: "tubes",
    get: ({ get }) => {
        const { stateAfterCleanups } = get(appliedCraftingActionsRecoil);
        return stateAfterCleanups.tubes;
    }
})


export function CraftingTable() {
    const updCraftingActions = useUpdRecoilState(craftingActionsRecoil);
    const act = (action: CraftingAction) => updCraftingActions({ $push: [action] });

    const tubes = useRecoilValue(tubesState);
    const { ingredientCount } = useRecoilValue(levelPresetRecoil);
    const ingredients = Array.from({length: ingredientCount}, (_, i) => i);

    const isWin = useRecoilValue(isWinRecoil);

    function IngredientButton({ sid, rev = false }: {
        sid: SubstanceId,
        rev?: boolean
    }) {
        return <button
            disabled={isWin}
            onClick={() => act({ action: "addIngredient", ingredientId: sid })}
            style={{
                transformOrigin: "50% 70%",
                transform: `rotate(${(rev ? -1 : 1) * 15}deg)`,
                borderRadius: "0px 0px 10px 10px",
            }}
        ><div style={{
            backgroundColor: substanceColors[sid],
            color: "#ffffffff",
            borderRadius: "0px 0px 5px 5px",
            width: "29px",
            height: "50px",
            fontSize: "35px",
            lineHeight: "62px",
        }}>{sid}</div></button>
    }

    return <div style={{
        backgroundColor: "#f4fff559",
        padding: "10px",
        ...flex.row,
    }}>
        <div style={{
            flex: 1,
            ...flex.col,
            justifyContent: "stretch",
        }}>
            <div style={{
                ...flex.row,
                justifyContent: "left",
            }}>
                {ingredients
                    .filter((_, i) => !(i % 2))
                    .map(sid => <IngredientButton sid={sid} />)}
            </div>
            <div style={{
                ...flex.rowRev,
                flexGrow: 1,
            }}>
                {tubes.length > 1 && <div>
                    <button
                        style={{
                            ...flex.row,
                        }}
                        disabled={isWin || !tubes[1] || tubes[0].length === 0}
                        onClick={() => act({ action: "pourFromMainIntoSecondary" })}
                    >&lt;</button>
                    <button
                        style={{
                            ...flex.row,
                        }}
                        disabled={isWin || !tubes[1] || tubes[1].length === 0}
                        onClick={() => act({ action: "pourFromSecondaryIntoMain" })}
                    >&gt;</button>
                </div>}
                {tubes.slice(1).map((t, i) => <Tube tube={t} />)}
            </div>
            <div>
                <button
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
        <div style={{
            flexShrink: 0,
        }}>
            <CraftingTube
                tube={tubes[0]}
                style={{
                    margin: "27px 10px 15px",
                }} />
        </div>
        <div style={{
            flex: 1,
            ...flex.col,
            justifyContent: "stretch",
        }}>
            <div style={{
                ...flex.row,
                justifyContent: "right",
            }}>
                {ingredients
                    .filter((_, i) => (i % 2))
                    .map(sid => <IngredientButton sid={sid} rev />)}
            </div>
            <CraftingTargets style={{
                flexGrow: 1,
            }} />
            <div style={{
                ...flex.row,
            }}>
                <button
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
            </div>
        </div>
    </div>;
}

function CraftingTube({ tube, style }: {
    tube: SubstanceId[];
    style?: CSSProperties;
}) {
    function Slot({ i }: { i: number; }) {
        return <div style={{
            textAlign: "center",
            margin: `0px 6px 6px 6px`,
            width: `28px`,
            height: `56px`,
            border: "2px dashed #ffffff60",
            borderRadius: "5px",
            fontSize: "38px",
            lineHeight: "58px",
            color: "#ffffff60",
            backgroundColor: "#ffffff08",

            ...(i >= tube.length ? {} : {
                backgroundColor: substanceColors[tube[i]],
                color: "#ffffffff",
                borderColor: "transparent",
            }),

            ...(i !== 0 ? {} : {
                borderBottomLeftRadius: "15px",
                borderBottomRightRadius: "15px",
            }),
        }}>{i === tube.length ? ("+") : tube[i]}</div>;
    }

    return <div style={{
        ...flex.colRev,

        height: "220px",
        background: "#ffffff4d",
        borderRadius: "0px 0px 999px 999px",
        border: "6px solid white",
        borderTopColor: "#ffffff30",
        ...style,
    }}>
        <Slot i={0} />
        <Slot i={1} />
        <Slot i={2} />
    </div>
}