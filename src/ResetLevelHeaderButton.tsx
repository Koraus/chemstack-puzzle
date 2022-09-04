import { css, cx } from "@emotion/css";
import { JSX } from "preact";
import { Refresh } from '@emotion-icons/material-rounded/Refresh';
import { useCraftingReset } from './solutionRecoil';


export function ResetLevelHeaderButton({
    className, ...props
}: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const reset = useCraftingReset();

    return <div {...props} className={cx(css`& {
        
    }`, className)}>
        <a
            className={css`& {
                display: block;
                color: #f7f7f750;
                text-decoration: none;
                padding: 0 24px 0 14px;
                height: 32px;
            }`}
            href="#"
            onClick={() => reset()}
        ><Refresh style={{ height: "100%" }} /></a>
    </div>;
}
