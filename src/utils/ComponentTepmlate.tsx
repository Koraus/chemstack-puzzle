import { css, cx } from "@emotion/css";
import { JSX } from "preact";


export function ComponentTepmlate({
    className, ...props
}: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    return <div {...props} className={cx(css`& {
        
    }`, className)} >

    </div>
}
