import { css, cx } from "@emotion/css";
import { JSX } from "preact";
import { useCraftingState } from "./craftingActionsRecoil";
import { Fireworks } from './Fireworks';


export function WinFireworks({
    className, ...props
}: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const { isSolved } = useCraftingState().currentState.state;
    return <>{isSolved && <Fireworks {...props} className={cx(css`& {
        pointer-events: none;
    }`, className)} />}</>;
}
