import { css, cx } from "@emotion/css";
import { LevelList } from "./LevelList";
import { JSX } from "preact";
import { Menu } from '@emotion-icons/material-rounded/Menu';
import * as flex from "./utils/flex";
import { useState } from "preact/hooks";


export function LevelListHeaderButton({
    className, ...props
}: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const [showMenu, setShowMenu] = useState(false);

    return <div {...props} className={cx(css`& {
        position: relative;
    }`, className)}>
        <a
            className={css`& {
                display: block;
                color: #f7f7f750;
                text-decoration: none;
                padding: 0 14px 0 24px;
                height: 32px;
            }`}
            href="#"
            onClick={() => setShowMenu(!showMenu)}
        > <Menu style={{ height: "100%" }} />
        </a>
        {showMenu && <LevelList style={{
            ...flex.rowS,
            position: "absolute",
            top: 35,
            height: 380,
            backgroundColor: "#344763",
            zIndex: 10,
            borderRight: "2px solid #ffffff50",
        }} />}
    </div>;
}
