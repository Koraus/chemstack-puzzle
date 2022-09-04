import { JSX } from "preact";
import { cx } from "@emotion/css";
import { buttonCss } from "./buttonCss";
import { useCraftingAct, useCraftingTransition } from "./solutionRecoil";
import { ArrowRight } from "@emotion-icons/material-rounded/ArrowRight";
import { isSolved } from "./puzzle/actions";


export function PourFromSecondaryIntoMainButton({ style, className }: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const act = useCraftingAct();
    const finalState = useCraftingTransition().state;

    return <button
        disabled={isSolved(finalState)}
        className={cx(buttonCss, className)}
        style={{
            display: "flex",
            alignItems: "center",
            width: "20px",
            height: "32px",
            ...style,
        }}
        onClick={() => act({ action: "pourFromSecondaryIntoMain", args: [] })}
    >
        <ArrowRight style={{ height: 80, margin: -20 }} />
    </button>;
}
