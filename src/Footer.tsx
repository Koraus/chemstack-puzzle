import { css, cx } from "@emotion/css";
import { Github } from '@emotion-icons/bootstrap/Github';
import { OpenInNew } from '@emotion-icons/material-rounded/OpenInNew';
import { JSX } from "preact";
import { AboutTeam } from "./AboutTeam";
import { useState } from "preact/hooks";
import { Groups } from '@emotion-icons/material-rounded/Groups';
import { buttonCss } from "./buttonCss";


export function Footer({
    isHorizontal, className, ...props
}: {
    isHorizontal?: boolean;
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const [isTeamShown, setIsTeamShown] = useState(false);

    const aboutTeam = <button
        className={cx(buttonCss, css`& { width: 35px; position: relative; }`)}
        onClick={() => setIsTeamShown(!isTeamShown)}
    >
        {isTeamShown && <AboutTeam className={cx(
            css`& { position: absolute; bottom: 130%; }`,
            isHorizontal
                ? css`& { right: 0; }`
                : css`& { left: 50%; translate: -50%; align-items: center; }`,
        )} />}
        <Groups style={{ height: "100%" }} />
    </button>;

    return <div {...props} className={cx(
        isHorizontal
            ? css`& {
                display: flex;
                align-items: end;
                flex-direction: column;
                justify-content: right;
                padding: 0 24px;
            }` : css`& {
                display: flex;
                flex: row;
                justify-content: center;
                align-items: center;
                padding: 8px 24px;
            }`,
        className)}>
        {isHorizontal && <>
            {aboutTeam}
            <div className={cx(css`& { height: 6px; }`)}></div>
        </>}
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
        {!isHorizontal && aboutTeam}
        <a
            style={{
                whiteSpace: "nowrap",
                flex: 1,
                display: "block",
                fontSize: "14px",
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
