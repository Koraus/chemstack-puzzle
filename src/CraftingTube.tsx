import { CraftingAction, SubstanceId } from "./crafting";
import { substanceColors } from "./substanceColors";
import * as flex from "./utils/flex";
import { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { css, cx, keyframes } from "@emotion/css";
import { buttonCss } from "./buttonCss";
import { ArrowLeft } from "@emotion-icons/material-rounded/ArrowLeft";
import { useRecoilValue } from "recoil";
import { appliedCraftingActionsRecoil, craftingActionsRecoil, tubesState } from "./CraftingTable";
import { useUpdRecoilState } from "./utils/useUpdRecoilState";

function Wave({ isFirst, ...props }: { isFirst: boolean, className?: string }) {
    return <svg
        id="Layer_2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64.87 45.06"
        {...props}
    >
        <g id="Layer_6">
            <g class="cls-2">
                {isFirst
                    ? <path class="cls-1" d="M0,13.42c.83,16.28,13.67,29.37,29.83,30.64h5.12c16.04-1.25,28.81-14.18,29.8-30.29-.84-4.49-9.53,18.63-31.72-3.69C18.09-4.97,.9-2.6,0,13.42Z" />
                    : <path class="cls-1" d="M33.08,10.08C17.72-5.38,0-2.46,0,14.76v13.77c0,8.57,6.95,15.53,15.53,15.53H49.34c8.58,0,15.53-6.95,15.53-15.53V14.76c0-8.15-8.39,18.86-31.79-4.68Z" />
                }
            </g>
        </g>
    </svg>;
}


function Slot({ i }: { i: number; }) {
    const updCraftingActions = useUpdRecoilState(craftingActionsRecoil);
    const act = (action: CraftingAction) => updCraftingActions({ $push: [action] });

    const tubes = useRecoilValue(tubesState);
    const tube = tubes[0];
    const isSecondaryAvailable = tubes.length > 1;

    const isNext = i === tube.length;
    const isTopContent = i === tube.length - 1;
    const hasContent = i < tube.length;
    const isFirst = i === 0;

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
        position: "relative",

        ...(hasContent && {
            backgroundColor: substanceColors[tube[i]],
            color: "#ffffffff",
            borderColor: "transparent",
        }),

        ...(isFirst && {
            borderBottomLeftRadius: "15px",
            borderBottomRightRadius: "15px",
        }),
    }}>
        {isNext
            ? <>
                <Wave
                    {...{ isFirst }}
                    className={css`
                        & {
                            position: absolute;
                            bottom: 0px;
                            left: 0px;
                            transform: scale(1.15);
                        }
                        & .cls-1 {
                            fill: transparent;
                            stroke: #C0C7CF;
                            stroke-width: 5px;
                        }
                    `}
                />+
            </>
            : tube[i]
        }
        {isTopContent && isSecondaryAvailable && <button
            className={cx(buttonCss)}
            style={{
                display: "flex",
                alignItems: "center",
                position: "absolute",
                left: "-24px",
                top: ["-10px", "3px", "16px"][i],
                width: "23px",
                height: "40px",
            }}
            onClick={() => act({ action: "pourFromMainIntoSecondary", time: performance.now() })}
        ><ArrowLeft style={{ height: 80, margin: -20 }} /></button>}
    </div>;
}

export function CraftingTube({ style }: {
    style?: JSX.CSSProperties;
}) {
    const appliedCraftingActions = useRecoilValue(appliedCraftingActionsRecoil);

    const [time, setTime] = useState<number>();
    useEffect(() => setTime(performance.now()));
    if (time === undefined) { return null; }

    return <div style={{
        ...flex.colRev,

        height: "220px",
        background: "#ffffff4d",
        borderRadius: "0px 0px 999px 999px",
        border: "6px solid #ffffff90",
        borderTopColor: "#ffffff30",
        ...style,
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
    </div>;
}
