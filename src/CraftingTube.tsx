import { CraftingAction } from "./crafting";
import { substanceColors } from "./substanceColors";
import { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { css, cx, keyframes } from "@emotion/css";
import { buttonCss } from "./buttonCss";
import { ArrowLeft } from "@emotion-icons/material-rounded/ArrowLeft";
import { useRecoilValue } from "recoil";
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { ReactComponent as CraftingTubeSvg } from "./craftingTube.svg";
import { craftingActionsRecoil, getCraftingState, craftingStateInTimeRecoil, useCraftingState } from "./craftingActionsRecoil";

function PourFromMainIntoSecondaryButton({ style, className }: {
    className?: string,
    style?: JSX.CSSProperties;
}) {
    const updCraftingActions = useUpdRecoilState(craftingActionsRecoil);
    const act = (action: CraftingAction) => updCraftingActions({ $push: [action] });

    return <button
        className={cx(buttonCss, className)}
        style={{
            display: "flex",

            alignItems: "center",
            width: "23px",
            height: "40px",
            ...style,
        }}
        onClick={() => act({ action: "pourFromMainIntoSecondary", time: performance.now() })}
    ><ArrowLeft style={{ height: 80, margin: -20 }} /></button>;
};

export function CraftingTube({ style }: {
    style?: JSX.CSSProperties;
}) {
    const craftingStateInTime = useCraftingState();
    const time = craftingStateInTime.currentTime;
    const craftingState = craftingStateInTime.currentState;


    const tube = craftingState.state.tubes[0];
    const prevTube = craftingState.prevState.tubes[0];
    const isSecondaryAvailable = craftingState.state.tubes.length > 1;

    return <div className={cx(css`& {
        width: 57px;
        position: relative;
    }`)} style={style}>
        <CraftingTubeSvg
            className={cx(css`
                ${[0, 1, 2].map(i => {
                const prevIsNext = prevTube.length === i;
                const prevHasContent = prevTube.length > i;
                const prevIsTopContent = i === prevTube.length - 1;
                const isNext = tube.length === i;
                const hasContent = tube.length > i;
                const isTopContent = i === tube.length - 1;
                return `
                    & #prev_slot${i}_content {
                        display: none;
                    }
                    & #prev_slot${i}_content_back {
                        fill: ${substanceColors[prevTube[i]]};
                    }
                    & #prev_slot${i}_number {
                        font-family: 'Bahnschrift', sans-serif;
                        text-anchor: middle;
                    }
                    & #slot${i}_add {
                        ${isNext ? "" : "display: none;"}
                    }
                    & #slot${i}_content {
                        ${hasContent ? "" : "display: none;"}
                    }
                    & #slot${i}_content_back {
                        fill: ${substanceColors[tube[i]]};
                    }
                    & #slot${i}_number {
                        font-family: 'Bahnschrift', sans-serif;
                        text-anchor: middle;
                    }
                    ${(() => {
                        // action add ingr animation
                        if (!isTopContent) { return ""; }
                        if (craftingState.id !== "craftingAct") { return ""; }
                        if (craftingState.diffCustom.action !== "addIngredient") { return ""; }
                        const { start, duration } = craftingState;
                        return `
                            & #slot${i}_content {
                                animation-name: ${keyframes`
                                    0% {
                                        transform: translate(0, -400px);
                                    }
                                    50% {
                                        transform: translate(0, 10px);
                                    }
                                    100% {
                                        transform: translate(0, 0px);
                                    }
                                    ## ${time}
                                `};
                                animation-duration: ${duration}ms;
                                animation-delay: ${start - time}ms;
                                animation-fill-mode: both;
                                animation-timing-function: linear;
                            }
                            & #slot${i}_content_ {
                                animation-name: ${keyframes`
                                    0% {
                                        transform: scale(1, 1);
                                    }
                                    50% {
                                        transform: scale(1, 1);
                                    }
                                    60% {
                                        transform: scale(1.1, 0.8);
                                    }
                                    78% {
                                        transform: scale(0.8, 1.3);
                                    }
                                    100% {
                                        transform: scale(1, 1);
                                    }
                                    ## ${time}
                                `};
                                animation-duration: ${duration}ms;
                                animation-delay: ${start - time}ms;
                                animation-fill-mode: both;
                                animation-timing-function: linear;
                            }
                        `;
                    })()}
                    ${(() => {
                        // reaction animation
                        if (craftingState.id !== "craftingReact") { return ""; }
                        const reaction = craftingState.diffCustom.find(d => d[0] === 0)?.[1];
                        if (!reaction) { return ""; }
                        const { start, duration, state, prevState } = craftingState;
                        console.log(craftingState);
                        const tube = craftingState.state.tubes[0];
                        const prevTube = craftingState.prevState.tubes[0];

                        let s = `
                            & #prev_slot${i}_content {
                                ${prevHasContent ? "display: unset;" : "display: none;"}
                            }
                        `;

                        if (i >= prevTube.length - reaction.reagents.length) {
                            s += `
                                & #prev_slot${i}_content_ {
                                    animation-name: ${keyframes`
                                        0% {
                                            transform: scale(1);
                                        }
                                        49% {
                                            transform: scale(0);
                                        }
                                        50% {
                                            transform: scale(0);
                                        }
                                        100% {
                                            transform: scale(0);
                                        }
                                        ## ${time}
                                    `};
                                    animation-duration: ${duration}ms;
                                    animation-delay: ${start - time}ms;
                                    animation-fill-mode: both;
                                    animation-timing-function: linear;
                                }
                            ;`
                        }

                        if (i >= tube.length - reaction.products.length) {
                            s += `
                                & #slot${i}_content_ {
                                    animation-name: ${keyframes`
                                        0% {
                                            transform: scale(0);
                                        }
                                        49% {
                                            transform: scale(0);
                                        }
                                        50% {
                                            transform: scale(0);
                                        }
                                        100% {
                                            transform: scale(1);
                                        }
                                        ## ${time}
                                    `};
                                    animation-duration: ${duration}ms;
                                    animation-delay: ${start - time}ms;
                                    animation-fill-mode: both;
                                    animation-timing-function: linear;
                                }
                            `;
                        }

                        return s;
                    })()}
                `;
            }).join('\n')}
            `)}
            slots={{
                prev_slot0_number: prevTube[0],
                prev_slot1_number: prevTube[1],
                prev_slot2_number: prevTube[2],
                slot0_number: tube[0],
                slot1_number: tube[1],
                slot2_number: tube[2],
            }}
        />
        {isSecondaryAvailable && tube.length > 0 && <PourFromMainIntoSecondaryButton
            style={{
                position: "absolute",
                left: "-10px",
                top: ["64%", "42%", "19%"][tube.length - 1],
            }}
        />}
    </div>;
}
