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
                padding: 0 14px 0 34px;
                height: 32px;
            }`}
            href="#"
            onClick={() => setShowMenu(!showMenu)}
        > <Menu style={{ height: "100%" }} />
        </a>
        {showMenu &&
            <div style={{
                ...flex.rowS,
                position: "fixed",
                top: 55,
                bottom: 0,
                backgroundColor: "#202020",
                zIndex: 1,
                borderRight: "1px solid #ffffff50",
            }}>
                <LevelList />
            </div>}
    </div>;
}
