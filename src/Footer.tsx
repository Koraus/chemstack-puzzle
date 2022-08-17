import { css, cx } from "@emotion/css";
import { Github } from '@emotion-icons/bootstrap/Github';
import { OpenInNew } from '@emotion-icons/material-rounded/OpenInNew';
import { JSX } from "preact";
import { AboutTeam } from "./AboutTeam";
import { useState } from "preact/hooks";
import { Groups } from '@emotion-icons/material-rounded/Groups';


export function Footer({
    isHorizontal, className, ...props
}: {
    isHorizontal?: boolean;
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const [isTeamShown, setIsTeamShown] = useState(false);
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
                    <div style={{ position: "relative", display: "flex", justifyContent: "flex-end",  }}> 
        {isHorizontal
            && isTeamShown
            && <AboutTeam
                style={{
                    position: "absolute",
                    bottom: "50px",
                    right: "0",
                    backgroundColor: "#5B6D80",
                    padding: "10px 15px",
                    whiteSpace: "nowrap",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    width: "fit-contnt",
                    color: "white",
                }} />}
        <button onClick={() => { isTeamShown ? setIsTeamShown(false) : setIsTeamShown(true) }} style={{margin: "6px 0"}}> <Groups style={{ height: 30, width: 30,  }} /> </button>
        </div>  
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
