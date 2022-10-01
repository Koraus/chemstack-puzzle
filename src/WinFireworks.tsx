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
    return <>{true && <div
        className={cx(css`& { pointer-events: none; }`, className)}
        {...props}
    >
        <div className={css({ height: "50%", position: "relative" })}>
            <Fireworks duration={1100} className={css({position: "absolute"})} />
            <Fireworks duration={1700} className={css({position: "absolute"})} />
        </div>
    </div>}</>;
}
