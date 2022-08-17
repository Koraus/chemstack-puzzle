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
        window.addEventListener("resize", upd);
        return () => window.removeEventListener("resize", upd);

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
                perspective-origin: center 170px;
                transform-style: preserve-3d;
                position: fixed;
                width: 33vmax;
                height: 33vmax;
            }`)} ref={refFixedChild}>

                <div className={cx(css`& {
                    position: absolute;
                    inset: 0;
                    transform-origin: center;
                    background: linear-gradient(black, #000e22 34%, #142a4a 55%, #e5f1f4);
                    transform: scale(40, 26) translate3d(0, 0, -2000px);
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
                            #add5def0 1%, 
                            #add5dee0 2%, 
                            #add5dec0 4%, 
                            #add5dea0 8%, 
                            #add5de80 16%, 
                            #add5de40 32%, 
                            #add5de20 64%, 
                            #add5de00);
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
