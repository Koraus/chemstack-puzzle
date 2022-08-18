import { TouchApp } from '@emotion-icons/material-rounded/TouchApp';
import { JSX } from "preact";
import { css, cx, keyframes } from '@emotion/css';
import { useEffect, useState } from "preact/hooks";


export function TouchAppAnimation({
    style, className,
}: {
    style?: JSX.CSSProperties;
    className?: string;
}) {
    const [now, setNow] = useState(0);
    useEffect(() => setNow(performance.now()), []);

    return <div
        className={cx(css`
            & {
                width: 100px;
                color: #ffffffd0;
                pointer-events: none;

                position: relative;
                z-index: 1;
            }
        `, className)}
        style={{ ...style }}
    >
        <div style={{
            width: "100%",
            position: "absolute",
            transformOrigin: "48% 23%",
            transform: `translate(-48%, -23%) rotate(-20deg)`,
        }}>
            <TouchApp className={css`& {
                transform-origin: 48% 23%;
                animation: ${keyframes`
                    0% { transform: scale(1); }
                    10% { transform: scale(0.6); }
                    30% { transform: scale(1); }
                    100% { transform: scale(1); }
                `} 1300ms ${-now}ms both infinite linear;
            }`} />
        </div>
    </div>;
}
