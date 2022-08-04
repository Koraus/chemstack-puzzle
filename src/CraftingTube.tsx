import { CraftingAction, SubstanceId } from "./crafting";
import { substanceColors } from "./substanceColors";
import * as flex from "./utils/flex";
import { JSX } from "preact";
import { useEffect, useState, useRef } from "preact/hooks";
import { css, cx, keyframes } from "@emotion/css";
import { buttonCss } from "./buttonCss";
import { ArrowLeft } from "@emotion-icons/material-rounded/ArrowLeft";
import { useRecoilValue } from "recoil";
import { appliedCraftingActionsRecoil, craftingActionsRecoil, tubesState } from "./CraftingTable";
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { ReactComponent as CraftingTubeSvg } from "./craftingTube.svg";

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
    const appliedCraftingActions = useRecoilValue(appliedCraftingActionsRecoil);

    const [time, setTime] = useState(0);
    useEffect(() => setTime(performance.now()), [appliedCraftingActions]);

    const tubes = appliedCraftingActions.stateFinal.tubes;
    const tube = tubes[0];
    const isSecondaryAvailable = tubes.length > 1;
    const isTopContent = (i: number) => i === tube.length - 1;

    return <div className={cx(css`& {
        width: 57px;
        position: relative;
    }`)} style={style}>
        <CraftingTubeSvg
            className={cx(css`
                ${[0, 1, 2].map(i => {
                const isNext = tube.length === i;
                const hasContent = tube.length > i;
                const isTopContent = i === tube.length - 1;
                return `
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
                        if (!isTopContent) { return ""; }
                        if (!("action" in appliedCraftingActions)) { return ""; }
                        const { action } = appliedCraftingActions;
                        if (action.action !== "addIngredient") { return ""; }
                        const startTime = action.time;
                        const duration = appliedCraftingActions.duration;
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
                                animation-delay: ${startTime - time}ms;
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
                                animation-delay: ${startTime - time}ms;
                                animation-fill-mode: both;
                                animation-timing-function: linear;
                            }
                        `;
                    })()}
                `;
            }).join('\n')}
            `)}
            slots={{
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
