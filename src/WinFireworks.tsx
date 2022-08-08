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
    const craftingStateInTime = useCraftingState();
    const craftingState = craftingStateInTime.currentState;
    const currentIsWin = craftingState.state.targets.length === 0;
    return <>{currentIsWin && <Fireworks {...props} className={cx(css`& {
        pointer-events: none;
    }`, className)} />}</>;
}
