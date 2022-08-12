import { css, cx } from "@emotion/css";
import { JSX } from "preact";
import { useRef, useEffect } from "preact/hooks";


export function GlobalBackground({
    className, ...props
}: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const refParent = useRef<HTMLDivElement>(null);
    const refFixedChild = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!refParent.current) { return; }
        if (!refFixedChild.current) { return; }

        const parent = refParent.current;
        const fixedChild = refFixedChild.current;

        const upd = () => {
            const rect = parent.getBoundingClientRect();
            fixedChild.style.width = rect.width + "px";
            fixedChild.style.height = rect.height + "px";
        }

        upd();
        parent.addEventListener("resize", upd);
        return () => parent.removeEventListener("resize", upd);

    }, [refParent.current, refFixedChild.current]);
    return <div {...props} className={cx(css`& {
    }`, className)}>
        <div className={cx(css`& {
            position: relative;
            width: 100%;
            height: 100%;
        }`)} ref={refParent}>
            <div className={cx(css`& {
                perspective: 400px;
                perspective-origin: center 120px;
                transform-style: preserve-3d;
                position: fixed;
            }`)} ref={refFixedChild}>

                <div className={cx(css`& {
                    position: absolute;
                    inset: 0;
                    transform-origin: center;
                    background: linear-gradient(black, #000e22 34%, #142a4a 55%);
                    transform: scale(26) translate3d(0, 0, -2000px);
                }`)}>
                </div>
                <div className={cx(css`& {
                    position: absolute;
                    inset: 0;
                    transform-origin: bottom;
                    transform: rotateX(90deg) translate(0, 35%);
                }`)}>
                    <div className={cx(css`& {
                        background: radial-gradient(closest-side, 
                            #ffffffff 1%, 
                            #ffffffe0 2%, 
                            #ffffffc0 4%, 
                            #ffffffa0 8%, 
                            #ffffff80 16%, 
                            #ffffff40 32%, 
                            #ffffff20 64%, 
                            #ffffff00);
                        transform-origin: center;
                        transform: scale(4);
                        width: 100%;
                        height: 100%;
                    }`)}>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}
