import { JSX } from "preact";
import { css, cx } from "@emotion/css";
import { buttonCss } from "./buttonCss";
import { ArrowLeft } from "@emotion-icons/material-rounded/ArrowLeft";
import { useCraftingAct, useCraftingTransition } from "./solutionRecoil";
import { TouchAppAnimation } from "./TouchAppAnimation";
import { tutorialRecoil } from "./tutorialRecoil";
import { useRecoilValue } from "recoil";
import { actions } from "./puzzle/actions";

export function PourFromMainIntoSecondaryButton({ style, className }: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const act = useCraftingAct();
    
    const tutorial = useRecoilValue(tutorialRecoil);
    const isHinted = tutorial.some(t => t.kind === "pourFromMainIntoSecondary");
    
    const craftingStateInTime = useCraftingTransition();
    const isCraftingIdle = craftingStateInTime.currentState.id === "idle";
    const canAct = actions.pourFromMainIntoSecondary().canAct(craftingStateInTime.state);

    return <button
        disabled={!canAct}
        className={cx(buttonCss, className)}
        style={{
            display: "flex",
            position: "relative",

            alignItems: "center",
            width: "23px",
            height: "40px",
            ...style,
        }}
        onClick={() => act({ action: "pourFromMainIntoSecondary", args: [] })}
    >
        <ArrowLeft style={{ height: 80, margin: -20 }} />
        {(isHinted && isCraftingIdle) && <TouchAppAnimation className={css`& {
            position: absolute;
            transform: translate(12px, 22px);
        }`} />}
    </button>;
}
