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

const PourFromMainIntoSecondaryButton = () => {
    const updCraftingActions = useUpdRecoilState(craftingActionsRecoil);
    const act = (action: CraftingAction) => updCraftingActions({ $push: [action] });

    return <button
        className={cx(buttonCss)}
        style={{
            display: "flex",
            position: "absolute",
            left: "-24px",
            top: ["-10px", "3px", "16px"][i],

            alignItems: "center",
            width: "23px",
            height: "40px",
        }}
        onClick={() => act({ action: "pourFromMainIntoSecondary", time: performance.now() })}
    ><ArrowLeft style={{ height: 80, margin: -20 }} /></button>;
};

function Slot({ i }: { i: number; }) {
    const tubes = useRecoilValue(tubesState);
    const tube = tubes[0];
    const isSecondaryAvailable = tubes.length > 1;

    const isTopContent = i === tube.length - 1;
    const hasContent = i < tube.length;
    const isFirst = i === 0;


    return <div style={{
        textAlign: "center",
        margin: `0px 6px 6px 6px`,
        width: `28px`,
        height: `56px`,
        border: "2px solid transparent",
        borderRadius: "5px",
        fontSize: "38px",
        lineHeight: "58px",
        color: "#ffffffff",
        position: "relative",

        ...(hasContent && {
            backgroundColor: substanceColors[tube[i]],
        }),

        ...(isFirst && {
            borderBottomLeftRadius: "15px",
            borderBottomRightRadius: "15px",
        }),
    }}>
        {tube[i]}
        {isTopContent &&
            isSecondaryAvailable &&
            <PourFromMainIntoSecondaryButton />}
    </div>;
}

export function CraftingTube({ style }: {
    style?: JSX.CSSProperties;
}) {
    const appliedCraftingActions = useRecoilValue(appliedCraftingActionsRecoil);

    const [time, setTime] = useState(0);
    useEffect(() => setTime(performance.now()), [appliedCraftingActions]);

    const tube = appliedCraftingActions.stateFinal.tubes[0];
    const isNext = (i: number) => tube.length === i;

    return <div className={cx(css`& {
        width: 57px;
        position: relative;
    }`)} style={style}>
        <CraftingTubeSvg
            className={cx(css`
                ${[0, 1, 2].map(i => `
                    & #slot${i}_add {
                        ${isNext(i) ? "" : "display: none;"}
                    }
                    & #slot${i}_content {
                        ${tube.length > i ? "" : "display: none;"}
                    }
                    & #slot${i}_content_back {
                        fill: ${substanceColors[tube[i]]};
                    }
                    & #slot${i}_number {
                        font-family: 'Bahnschrift', sans-serif;
                        text-anchor: middle;
                    }
                `).join('\n')}
            `)}
            slots={{
                slot0_number: tube[0],
                slot1_number: tube[1],
                slot2_number: tube[2],
            }}
        />

        {/* <div style={{
            ...flex.colRev,

            height: "220px",
            border: "6px solid transparent",
            position: "absolute",
            top: 0,
        }}>
            {("action" in appliedCraftingActions) && (() => {
                const { action } = appliedCraftingActions;
                if (action.action !== "addIngredient") { return null; }
                return <div style={{ position: "relative" }}>
                    <div
                        className={css`& {
                        position: absolute;
                        animation-name: ${keyframes`
                            0% {
                                transform: translate(0, -300px);
                            }
                            100% {
                                transform: translate(0, -150px);
                            }
                            ## ${time}
                        `};
                        animation-duration: ${appliedCraftingActions.duration}ms;
                        animation-delay: ${action.time - time}ms;
                        animation-fill-mode: both;
                    }`}
                    >
                        {action.ingredientId}
                    </div>
                </div>
            })()}
            <Slot i={0} />
            <Slot i={1} />
            <Slot i={2} />
        </div> */}
    </div>;
}
