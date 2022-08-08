import { css, cx } from "@emotion/css";
import { Github } from '@emotion-icons/bootstrap/Github';
import { OpenInNew } from '@emotion-icons/material-rounded/OpenInNew';
import { JSX } from "preact";


export function Footer({
    isHorizontal, className, ...props
}: {
    isHorizontal?: boolean;
    className?: string;
    style?: JSX.CSSProperties;
}) {

    return <div {...props} className={cx(
        isHorizontal
            ? css`& {
                flex-direction: column;
                justify-content: right;
                padding: 0 8px;
            }` : css`& {
                display: flex;
                flex: row;
                justify-content: center;
                align-items: center;
                padding: 8px 14px;
            }`,
        className)}>
        <a
            style={{
                flex: 1,
                display: "block",
                color: "white",
                fontSize: "24px",
                textAlign: isHorizontal ? "right" : "left",
            }}
            target="_blank"
            href="https://www.gkzr.me"
        >
            {!isHorizontal && <OpenInNew style={{ height: 20, marginRight: 5 }} />}
            GKZR
            {isHorizontal && <OpenInNew style={{ height: 20, marginLeft: 5 }} />}
        </a>
        <a
            style={{
                flex: 1,
                display: "block",
                fontSize: "16px",
                lineHeight: "28px",
                color: "white",
                textAlign: "right",
            }}
            target="_blank"
            href="https://github.com/ndry/chemstack-puzzle"
        >
            chemstack-puzzle
            <Github style={{ height: 20, marginLeft: 5 }} />
        </a>
    </div>;
}
