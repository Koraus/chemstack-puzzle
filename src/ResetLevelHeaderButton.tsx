import { useRecoilTransaction_UNSTABLE } from 'recoil';
import { css, cx } from "@emotion/css";
import { JSX } from "preact";
import { Refresh } from '@emotion-icons/material-rounded/Refresh';
import { craftingActionsRecoil } from './craftingActionsRecoil';


export function ResetLevelHeaderButton({
    className, ...props
}: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const reset = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        set(craftingActionsRecoil, []);
    });

    return <div {...props} className={cx(css`& {
        
    }`, className)}>
        <a
            className={css`& {
                display: block;
                color: #f7f7f750;
                text-decoration: none;
                padding: 0 34px 0 14px;
                height: 32px;
            }`}
            href="#"
            onClick={() => reset()}
        > <Refresh style={{ height: "100%" }} />
        </a>
    </div>;
}
