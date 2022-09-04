import { css, cx } from "@emotion/css";
import { JSX } from "preact";
import { useCraftingTransition } from "./solutionRecoil";
import { Fireworks } from './Fireworks';


export function WinFireworks({
    className, ...props
}: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const { isSolved } = useCraftingTransition().currentState.state;
    return <>{isSolved && <Fireworks {...props} className={cx(css`& {
        pointer-events: none;
    }`, className)} />}</>;
}
