import { useRecoilValue } from 'recoil';
import * as flex from "./utils/flex";
import * as _ from "lodash";
import { Tube } from "./Tube";
import { CraftingAction, SubstanceId } from './crafting';
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { CraftingTargets } from "./CraftingTargets";
import { isWinRecoil } from "./Win";
import { levelPresetRecoil } from "./LevelList";
import { buttonCss } from "./buttonCss";
import { CraftingIngredientButton } from "./CraftingIngredientButton";
import { CraftingTube } from "./CraftingTube";
import { levelPresets } from "./levelPresets";
import { TouchAppAnimation } from "./TouchAppAnimation";
import { css, cx, keyframes } from "@emotion/css";
import { JSX } from "preact";
import { Refresh } from '@emotion-icons/material-rounded/Refresh';
import { Add } from '@emotion-icons/material-rounded/Add';
import { Close } from '@emotion-icons/material-rounded/Close';
import { craftingActionsRecoil, craftingStateInTimeRecoil, getCraftingState, useCraftingState } from "./craftingActionsRecoil";
import { tutorialRecoil } from './tutorialRecoil';

function CraftingIngredientPanel({
    style, className,
}: {
    style?: JSX.CSSProperties;
    className?: string;
}) {
    const tutorial = useRecoilValue(tutorialRecoil);
    const needHint = (sid: SubstanceId) => tutorial.some(t => 
        t.kind === "addIngredient"
        && t.ingredientId === sid);

    const { ingredientCount } = useRecoilValue(levelPresetRecoil);
    const ingredients = Array.from({ length: ingredientCount }, (_, i) => i);

    const touchAppAnimationCss = css`& {
        position: absolute;
        left: 32px;
        bottom: 10px;
    }`;

    return <div
        className={cx(className)}
        style={{ ...style }}
    >
        <div style={{ ...flex.row, flex: 1 }}>
            {ingredients
                .filter((_, i) => !(i > 2))
                .map(sid => <div style={{ position: "relative", }}>
                    <CraftingIngredientButton sid={sid} />
                    {needHint(sid) && <TouchAppAnimation className={touchAppAnimationCss} />}
                </div>)}
        </div>
        <div style={{ ...flex.rowRev, flex: 1 }}>
            {ingredients
                .filter((_, i) => (i > 2))
                .map(sid => <div style={{ position: "relative", }}>
                    <CraftingIngredientButton sid={sid} mirrored />
                    {needHint(sid) && <TouchAppAnimation className={touchAppAnimationCss} />}
                </div>)}
        </div>
    </div>
}

export function CraftingTable() {
    const craftingActions = useRecoilValue(craftingActionsRecoil);
    const updCraftingActions = useUpdRecoilState(craftingActionsRecoil);
    const act = (action: CraftingAction) => updCraftingActions({ $push: [action] });

    const craftingStateInTime = useCraftingState();
    const time = craftingStateInTime.currentTime;
    const craftingState = craftingStateInTime.currentState;

    const { tubes } =
        getCraftingState(useRecoilValue(craftingStateInTimeRecoil)).state;
    const isWin = useRecoilValue(isWinRecoil);

    const tutorial = useRecoilValue(tutorialRecoil);
    const hintReset = tutorial.some(t => t.kind === "reset");

    return <div style={{
        backgroundColor: "#f4fff559",
        padding: "8px 10px",
        ...flex.col,
    }}>
        <CraftingIngredientPanel style={{ ...flex.row }} />

        <div style={{
            ...flex.row,
            marginTop: 10,
        }}>
            <div style={{
                ...flex.rowRev,
                position: "relative",
                perspective: "120px",
                perspectiveOrigin: "center 120px",
                transformStyle: "preserve-3d",
                flex: 1,
            }}>
                {tubes.slice(1).map((t, i) => {
                    if (i === 0) { 
                        return <Tube 
                            isPourable 
                            tube={t}
                            className={cx(
                                craftingState.id === 'craftingAct'
                                && craftingState.diffCustom.action === 'addTube'
                                && css`
                                    & {
                                        transform-origin: bottom;
                                        animation-name: ${keyframes`
                                            0% {
                                                transform: translate3d(43px, 0, 39px);
                                            }
                                            100% {
                                                transform: translate3d(0, 0, 0);
                                            }
                                            ## ${time}
                                        `};
                                        animation-duration: ${craftingState.duration}ms;
                                        animation-delay: ${craftingState.start - time}ms;
                                        animation-fill-mode: both;
                                        animation-timing-function: linear;
                                    }
                                `,
    
                            )} 
                        />;
                    }
                    const prevDx = (i - 1 - 1) * 23 + 15;
                    const prevDz = Math.pow((i - 1), 0.4) * 20 + 40;
                    const dx = (i - 1) * 23 + 15;
                    const dz = Math.pow((i - 1), 0.4) * 20 + 40;
                    return <Tube
                        style={{
                            position: "absolute",
                            transform: `translate3d(${-dx}px, 0, ${-dz}px)`,


                        }}
                        className={cx(
                            craftingState.id === 'craftingAct'
                            && craftingState.diffCustom.action === 'addTube'
                            && css`
                                & {
                                    transform-origin: bottom;
                                    animation-name: ${keyframes`
                                        0% {
                                            transform: translate3d(${-prevDx}px, 0, ${-prevDz}px);
                                        }
                                        100% {
                                            transform: translate3d(${-dx}px, 0, ${-dz}px);
                                        }
                                        ## ${time}
                                    `};
                                    animation-duration: ${craftingState.duration}ms;
                                    animation-delay: ${craftingState.start - time}ms;
                                    animation-fill-mode: both;
                                    animation-timing-function: linear;
                                }
                            `,

                        )}

                        shadow={<div style={{
                            position: "absolute",
                            top: 0,
                            left: "47%",
                            right: "-47%",
                            bottom: "-5px",
                            background: "#00000040",
                            borderBottomLeftRadius: "999px",
                            borderBottomRightRadius: "999px",
                        }}></div>}
                        tube={t}
                    />;
                })}
            </div>
            <CraftingTube style={{ margin: "-55px 40px -18px" }} />
            <CraftingTargets style={{ flex: 1 }} />
        </div>

        <div style={{ ...flex.row, flex: 1 }}>

            <div style={{ flex: 3 }}>
            </div>
            <div style={{
                flex: 5,
                ...flex.row,
                justifyContent: "space-between",
            }}>
                <button
                    className={buttonCss}
                    style={{
                        ...flex.row,
                        alignItems: "center",
                    }}
                    disabled={isWin || tubes.length > 6}
                    onClick={() => act({ action: "addTube", time: performance.now() })}
                >
                    <Add style={{
                        height: "30px",
                        margin: "0 0 0 -6px",
                        zIndex: 1,
                    }} />
                    <div style={{
                        margin: "0 0 0 -11px",
                        width: "10px",
                        height: "26px",
                        backgroundColor: "#cccccc",
                        borderRadius: "0px 0px 999px 999px",
                    }}></div>
                </button>
                <button
                    className={buttonCss}
                    style={{
                        ...flex.row,
                        alignItems: "center",
                    }}
                    disabled={isWin || tubes.length <= 1}
                    onClick={() => act({ action: "trashTube", time: performance.now() })}
                >
                    <Close style={{
                        height: "30px",
                        margin: "0 0 0 -6px",
                        zIndex: 1,
                        color: "#ff7070",
                    }} />
                    <div style={{
                        margin: "0 0 0 -11px",
                        width: "10px",
                        height: "26px",
                        backgroundColor: "#cccccc",
                        borderRadius: "0px 0px 999px 999px",
                    }}></div>
                </button>
            </div>
            <div style={{ ...flex.rowRev, flex: 3 }}>
                <button
                    className={buttonCss}
                    style={{
                        ...flex.row,
                        width: 33,
                        color: "#ff7070",
                        position: "relative",
                    }}
                    disabled={isWin || craftingActions.length === 0}
                    onClick={() => updCraftingActions({ $set: [] })}
                >
                    <Refresh style={{
                        height: "100%",
                        margin: "0px -4px",
                    }} />
                    {(hintReset) && <TouchAppAnimation className={css`& {
                        position: absolute;
                        transform: translate(20px, 33px);
                    }`} />}
                </button>
            </div>

        </div>
    </div>;
}

