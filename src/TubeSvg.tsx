import { css, cx, keyframes } from "@emotion/css";
import { hexColorToRgb, rgbToHsl, substanceColors } from "./substanceColors";
import svgSource from "./tube.svg?raw";
import { JSX } from "preact";
import { SubstanceId } from "./puzzle/state";
import { StateTransition } from "./StateTransition";
import { Reaction } from "./puzzle/reactions";

const svgEl = new DOMParser().parseFromString(svgSource, "text/html")
    .body.firstElementChild as SVGSVGElement;

const svgBox = {
    x: svgEl.viewBox.baseVal.x,
    y: svgEl.viewBox.baseVal.y,
    width: svgEl.viewBox.baseVal.width,
    height: svgEl.viewBox.baseVal.height
};

const percentStr = (x: number) => `${x * 100}%`;

function select(
    selector: string,
    style: string = "/* _std */",
    tap?: (svg: SVGSVGElement) => (() => unknown) | undefined | void
) {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = style
        .replaceAll("/* _std */", /*css*/`svg * { visibility: hidden; } & * { visibility: visible; }`)
        .replaceAll('&', selector);
    const defs = svgEl.getElementsByTagName("defs")[0];
    defs.appendChild(styleEl);
    const untap = tap?.(svgEl);

    document.body.appendChild(svgEl);
    const bBox =
        (svgEl.querySelector(selector)! as SVGGraphicsElement)
            .getBBox();
    document.body.removeChild(svgEl);
    svgEl.setAttribute(
        "viewBox",
        `${bBox.x} ${bBox.y} ${bBox.width} ${bBox.height}`);

    const s = svgEl.outerHTML;

    defs.removeChild(styleEl);
    untap?.();

    return {
        url: URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' })),
        box: {
            x: bBox.x,
            y: bBox.y,
            width: bBox.width,
            height: bBox.height,
        },
    }
}

const slotIndices = [0, 1, 2, 3, 4];
const slotBoxes = slotIndices.map(i => select(`#slot${i}_content`).box);

const secondaryColor = (hexColor: string) => {
    const { h, s, l } = rgbToHsl(hexColorToRgb(hexColor));
    return `hsl(${((h - 20) + 360) % 360}, ${s * 0.85}%, ${l * 0.85}%)`;
}

export const assets = {
    box: svgBox,
    foreground: select('#foreground'),
    background: select('#background'),
    backgroundSolid: select('#background', /*css*/`/* _std */& { opacity: 1; }`),
    slots: {
        boxes: slotBoxes,
        empty: (() => {
            const bottom = select(`#slot0_empty`, /*css*/ `/* _std */#slot0_add * { visibility: hidden; }`);
            const regular = select(`#slot1_empty`, /*css*/ `/* _std */#slot1_add * { visibility: hidden; }`);
            return Object.assign((i: number) => ({
                url: (i === 0 ? bottom : regular).url,
                box: slotBoxes[i],
            }), { bottom, regular });
        })(),
        emptyAdd: (() => {
            const bottom = select(`#slot0_empty`);
            const regular = select(`#slot1_empty`);
            return Object.assign((i: number) => ({
                url: (i === 0 ? bottom : regular).url,
                box: slotBoxes[i],
            }), { bottom, regular });
        })(),
        content: (() => {
            const s = (i: 0 | 1, sid: SubstanceId) => {
                const color = substanceColors[sid];
                return select(`#slot${i}_content`, /*css*/ `/* _std */
                    #slot0_content_back1_gradient * {
                        stop-color: ${color};
                    }
                    #slot${i}_content_back_gradient :nth-child(1) {
                        stop-color: ${secondaryColor(color)};
                    }
                    #slot${i}_content_back_gradient :nth-child(2) {
                        stop-color: ${color};
                    }
                    #slot${i}_number {
                        font-family: 'Bahnschrift', sans-serif;
                        text-anchor: middle;
                        dominant-baseline: central;
                        font-size: 76px;
                        fill: white;
                    }
                `,
                    svgEl => {
                        const el = svgEl.querySelector(`#slot${i}_number`)!;
                        const original = el.innerHTML;
                        el.innerHTML = sid.toString();
                        return () => el.innerHTML = original;
                    }
                );
            };
            const bottom = substanceColors.map((_, i) => s(0, i));
            const regular = substanceColors.map((_, i) => s(1, i));
            return Object.assign((i: number, sid: SubstanceId) => ({
                url: (i === 0 ? bottom : regular)[sid].url,
                box: slotBoxes[i],
            }), { bottom, regular });
        })(),
    },
};

type Asset = typeof assets.background;

function AssetImg({
    asset: { box, url }, className, ...props
}: JSX.IntrinsicElements["img"] & {
    asset: Asset
}) {
    return <img
        className={cx(css({
            position: "absolute",
            width: percentStr(box.width / svgBox.width),
            height: percentStr(box.height / svgBox.height),
            left: percentStr(box.x / svgBox.width),
            top: percentStr(box.y / svgBox.height),
        }), className)}
        src={url}
        {...props}
    ></img>
}

const prevCss = slotIndices.map(i => css`
    & .prev_slot${i}_content { visibility: unset; }
    & .slot${i}_content { visibility: hidden; }
`);

const nextCss = slotIndices.map(i => css`
    & .prev_slot${i}_content { visibility: hidden; }
    & .slot${i}_content { visibility: unset; }
`);

function pourDownAnimationCss({ i, now, start, duration }: {
    i: number,
    now: number,
    start: number,
    duration: number,
}) {
    return css`
        & .slot${i}_content {
            transform-origin: 50% 100%;
            animation: ${keyframes`
                0%, 30% { translate: 0 -300%; }
                60% { translate: 0 8%; }
                100% { translate: 0 0; }

                0%, 30% { opacity: 0; }
                45%, 100% { opacity: 1; }
                
                0%, 60% { scale: 1 1; }
                70% { scale: 1.1 0.8; }
                88% { scale: 0.8 1.3; }
                100% { scale: 1 1; }
            `} ${duration}ms ${start - now}ms linear both;
        }
    `;
}

function pourUpAnimationCss({ i, now, start, duration }: {
    i: number,
    now: number,
    start: number,
    duration: number,
}) {
    return css`
        & .prev_slot${i}_content {
            transform-origin: 50% 100%;
            animation: ${keyframes`
                0% { translate: 0 0; }
                50%, 100% { translate: 0 -300%; }

                0%, 40% { opacity: 1; }
                50%, 100% { opacity: 0; }

                0% { scale: 1 1; }
                10% { scale: 0.9 1.05; }
                50%, 100% { scale: 0.7 1.2; }
            `} ${duration}ms ${start - now}ms linear both;
        }
    `;
}

function cleanAnimationCss({ i, now, start, duration }: {
    i: number,
    now: number,
    start: number,
    duration: number,
}) {
    return css`
        & .prev_slot${i}_content {
            transform-origin: 50% 60%;
            animation: ${keyframes`
                0% { scale: 1 1; }
                25% { scale: 1 1; }
                35% { scale: 0.5 1; }
                70% { scale: 1.5 0.5; }
                100% { scale: 2 0; }
            `} ${duration}ms ${start - now}ms linear both;
        }
        & .prev_slot${i}_number {
            animation: ${keyframes`
                0%, 22% { opacity: 1; }
                25%, 100% { opacity: 0; }
            `} ${duration}ms ${start - now}ms linear both;
        }
`;
}

function reactAnimationCss({
    prevTube,
    tube,
    reaction,
    now, start, duration,
}: {
    prevTube: SubstanceId[],
    tube: SubstanceId[],
    reaction: Reaction,
    now: number,
    start: number,
    duration: number,
}) {
    return [
        ...prevTube.map((_, i) => css`& .prev_slot${i}_content { visibility: unset; }`),
        ...tube.map((_, i) => css`& .slot${i}_content { visibility: unset; }`),
        ...reaction.reagents.map((_, i, arr) => css`
            & .prev_slot${prevTube.length - arr.length + i}_content {
                animation: ${keyframes`
                    0% { transform: scale(1); }
                    50%, 100% { transform: scale(0); }
                `} ${duration}ms ${start - now}ms linear both;
            }`),
        ...reaction.products.map((_, i, arr) => css`
            & .slot${tube.length - arr.length + i}_content {
                animation: ${keyframes`
                    0%, 50% { transform: scale(0); }
                    100% { transform: scale(1); }
                `} ${duration}ms ${start - now}ms linear both;
            }`),
    ]
}

export function TubeSvg({
    tubeTransition: {
        prevState: prevTube,
        state: tube,
        desc,
        duration,
        start,
    },
    now,
    noBorder: noAdd,
    inactive,
    svgIdPrefix,
    ...props
}: {
    tubeTransition: StateTransition<
        SubstanceId[],
        { id: "next" | "prev" | "pourDown" | "pourUp" | "clean" }
        | { id: "react", reaction: Reaction }
    >;
    now: number;
    noBorder?: boolean;
    inactive?: boolean;
    svgIdPrefix: string;
    className?: string;
    style?: JSX.CSSProperties;
}) {
    // import.meta.env.DEV && console.log("inside TubeSvg", svgIdPrefix);
    const { width: bw, height: bh, x: bx, y: by } = assets.background.box;
    return <div className={cx(
        css({
            position: "relative",
            aspectRatio: `${bw} / ${bh}`,
        }),
        props.className,
    )}>
        <div className={cx(
            css({
                position: "absolute",
                width: percentStr(svgBox.width / bw),
                height: percentStr(svgBox.height / bh),
                left: percentStr(-bx / bw),
                top: percentStr(-by / bh),
            }),
            prevCss,
            "next" === desc.id && nextCss,
            "pourDown" === desc.id && [
                nextCss,
                pourDownAnimationCss({
                    i: tube.length - 1,
                    duration, start, now,
                })],
            "pourUp" === desc.id && [
                pourUpAnimationCss({
                    i: prevTube.length - 1,
                    duration, start, now,
                })],
            "clean" === desc.id
            && prevTube.length !== tube.length
            && [3, 4].map(i => cleanAnimationCss({
                i, duration, start, now,
            })),
            "react" === desc.id && reactAnimationCss({
                tube,
                prevTube,
                reaction: desc.reaction,
                duration, start, now,
            }),
        )}>
            <AssetImg asset={assets[inactive ? "backgroundSolid" : "background"]} />

            {[0, 1, 2].map(i => {
                const _noAdd = (noAdd || (i !== tube.length));
                return _noAdd && <AssetImg asset={assets.slots.empty(i)} />;
            })}

            {!noAdd && tube.length <= 3 && <AssetImg asset={assets.slots.emptyAdd(tube.length)} />}

            {prevTube.map((sid, i) => <AssetImg
                className={`prev_slot${i}_content`}
                asset={assets.slots.content(i, sid)}
            />)}

            {tube.map((sid, i) => <AssetImg
                className={`slot${i}_content`}
                asset={assets.slots.content(i, sid)}
            />)}

            {!inactive && <AssetImg asset={assets.foreground} />}
        </div>
    </div>
}