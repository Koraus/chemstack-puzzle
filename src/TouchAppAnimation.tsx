import { TouchApp } from '@emotion-icons/material-rounded/TouchApp';
import { JSX } from "preact";
import { css, cx } from '@emotion/css';
import { useAnimationFrameTime } from './utils/useAnimationFrameTime';


export function TouchAppAnimation({
    style, className,
}: {
    style?: JSX.CSSProperties;
    className?: string;
}) {
    const t = useAnimationFrameTime([]);
    const s = 1 + 0.1 * Math.sin(t / 300);
    return <div
        className={cx(css`
            & {
                width: 100px;
                color: #ffffffd0;
                pointer-events: none;

                position: relative;
            }
        `, className)}
        style={{...style}}
    >
        <div style={{
            width: "100%",
            position: "absolute",
            transformOrigin: "48% 23%",
            transform: `translate(-48%, -23%)`,
        }}>
            <TouchApp style={{
                transformOrigin: "48% 23%",
                transform: `scale(${s}) rotate(-20deg)`,
            }} />
        </div>
    </div>;
}
