import { JSX } from "preact";
import { css, cx, keyframes } from "@emotion/css";
import { useCraftingTransition } from "./solutionRecoil";
import { PourFromMainIntoSecondaryButton } from "./PourFromMainIntoSecondaryButton";
import { TubeSvg } from "./TubeSvg";
import { actions } from "./puzzle/actions";


export function CraftingTube({ style }: {
    style?: JSX.CSSProperties;
}) {
    const finalState = useCraftingTransition().state;
    const finalTube = finalState.tubes[0];

    const canPour = actions.pourFromMainIntoSecondary().canAct(finalState);

    const craftingStateInTime = useCraftingTransition();
    const time = craftingStateInTime.currentTime;
    const craftingState = craftingStateInTime.currentState;
    

    const reaction =
        craftingState.id === "react"
        && craftingState.diffCustom.find(d => d[0] === 0)?.[1];

    return <div className={cx(css`& {
        width: 57px;
        position: relative;
    }`)} style={style}>
        <TubeSvg
            svgIdPrefix="CraftingTube"
            className={cx(
                craftingState.id === "act"
                && craftingState.diffCustom.action === "addTube"
                && css`
                    & {
                        transform-origin: bottom;
                        animation: ${keyframes`
                            0% { transform: scale(0); }
                            100% { transform: scale(1); }
                        `} ${craftingState.duration}ms ${craftingState.start - time}ms both linear;
                    }
                `,
                craftingState.id === "act"
                && craftingState.diffCustom.action === "swapTubes"
                && css`
                    & {
                        transform-origin: bottom;
                        animation: ${keyframes`
                            0% { scale: 1;  translate: 0, 0; }
                            100% { scale: 0.65; translate: -87px -31px; }
                        `} ${craftingState.duration}ms   ${craftingState.start - time}ms both linear;
                    }
                `,
                craftingState.id === 'act'
                && craftingState.diffCustom.action === 'trashTube'
                && css`
                    & {
                        transform-origin: bottom;
                        animation: ${keyframes`
                            0% { transform: scale(1); }
                            100% { transform: scale(0); }
                        `} ${craftingState.duration}ms ${craftingState.start - time}ms both linear;
                        } 
                    `,
                craftingState.id === 'giveaway'
                && craftingState.diffCustom === 0
                && css`
                    & {
                        transform-origin: bottom;
                        animation: ${keyframes`
                            0%, 3 { transform: translateY(0); }
                            10% { transform: translateY(-6%); }
                            15%, 58% { transform: translateY(-5%); opacity: 1; }
                            60% { transform: translateY(-4%); }
                            62% { transform: translateY(-5%); }
                            100% { transform: translateY(-25%); opacity: 0; }
                        `} ${craftingState.duration}ms ${craftingState.start - time}ms both linear;
                        } 
                    `,

            )}
            tubeTransition={{
                prevState: craftingState.prevState.tubes[0],
                state: craftingState.state.tubes[0],
                start: craftingState.start,
                duration: craftingState.duration,
                desc: (() => {
                    if (craftingState.id === "act") {
                        switch (craftingState.diffCustom.action) {
                            case "addIngredient": return { id: "pourDown" };
                            case "addTube": return { id: "next" };
                            case "pourFromMainIntoSecondary": return { id: "pourUp" };
                            case "pourFromSecondaryIntoMain": return { id: "pourDown" };           
                        }
                    }
                    if (craftingState.id === "react" && reaction) {
                        return { id: "react", reaction };
                    }
                    if (craftingState.id === "cleanup") {
                        return { id: "clean" };
                    }
                    if (craftingState.id === "giveaway") {
                        return { id: "prev" };
                    }
                    return { id: "prev" };
                })(),
            }}
            now={time}
        />
        {canPour && <PourFromMainIntoSecondaryButton
            style={{
                position: "absolute",
                left: "-10px",
                top: ["71%", "47%", "24%"][finalTube.length - 1],
            }}
        />}
    </div>;
}
