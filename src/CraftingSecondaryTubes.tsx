import * as flex from "./utils/flex";
import { Tube } from "./Tube";
import { css, cx, keyframes } from "@emotion/css";
import { JSX } from "preact";
import { useCraftingState } from "./craftingActionsRecoil";


export function CraftingSecondaryTubes({
    className, ...props
}: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const craftingStateInTime = useCraftingState();
    const time = craftingStateInTime.currentTime;
    const craftingState = craftingStateInTime.currentState;
    const tubes = craftingState.state.tubes;

    return <div
        {...props}
        className={cx(flex.rowRev, css`& {
            position: relative;
            perspective: 120px;
            perspective-origin: center 120px;
            transform-style: preserve-3d;
        }`, className)}
    >
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

                        craftingState.id === 'craftingAct'
                        && craftingState.diffCustom.action === 'trashTube'
                        && css`
                                & {
                                    animation-name: ${keyframes`
                                    0% {
                                        transform: translate3d(0, 0, 0);
                                    }
                                    100% {
                                        transform: translate3d(43px, 0, 39px);
                                    }
                                    ## ${time}
                                `};
                                animation-duration: ${craftingState.duration}ms;
                                animation-delay: ${craftingState.start - time}ms;
                                animation-fill-mode: both;
                                animation-timing-function: linear;
                                }
                                `

                    )} />;
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
                            `

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
                tube={t} />;
        })}
    </div>;
}
