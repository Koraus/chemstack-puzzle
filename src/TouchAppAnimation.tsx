import { TouchApp } from '@emotion-icons/material-rounded/TouchApp';
import { JSX } from "preact";
import { css, cx, keyframes } from '@emotion/css';


export function TouchAppAnimation({
    style, className,
}: {
    style?: JSX.CSSProperties;
    className?: string;
}) {
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
                animation-name: ${keyframes`
                    0% {
                        transform: scale(1);
                    }
                    10% {
                        transform: scale(0.6);
                    }
                    30% {
                        transform: scale(1);
                    }
                    100% {
                        transform: scale(1);
                    }
                `};
                animation-duration: 1300ms;
                animation-fill-mode: both;
                animation-iteration-count: infinite;
                animation-timing-function: linear;
            }`} />
        </div>
    </div>;
}
