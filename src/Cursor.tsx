import { HandIndexFill } from '@emotion-icons/bootstrap/HandIndexFill';
import { useEffect, useRef } from "preact/hooks";
import { css, cx } from "@emotion/css";

export function Cursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const cursorEl = cursorRef.current!;
        const move = (ev: MouseEvent) => {
            cursorEl.style.setProperty("translate", `${ev.clientX}px ${ev.clientY}px`);
        }
        const down = (ev: MouseEvent) => {
            cursorEl.style.setProperty("scale", `0.8 0.8`);
        }
        const up = (ev: MouseEvent) => {
            cursorEl.style.setProperty("scale", `1 1`);
        }
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
        document.addEventListener("mousedown", down);

        () => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
            document.removeEventListener("mousedown", down);
        }
    })

    return <div
        ref={cursorRef}
        className={cx(css({
            color: "white",
            position: "absolute",
            left: 0,
            top: 0,
            pointerEvents: "none",
            zIndex: 1000,
            width: 0,
            height: 0,
        }))}
    >
        <HandIndexFill
            className={cx(css({
                width: 100,
                color: "white",
                translate: "-40% -10%"
            }))}
        />
    </div>;
}