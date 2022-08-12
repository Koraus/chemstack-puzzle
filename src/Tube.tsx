import { css, cx, keyframes } from "@emotion/css";
import { SubstanceId } from "./crafting";
import { substanceColors } from "./substanceColors";
import * as flex from "./utils/flex";
import { JSX, ComponentChildren } from "preact";
import { buttonCss } from "./buttonCss";
import { useCraftingAct } from "./craftingActionsRecoil";

export function TubeSlot({
    isBottom,
    sid,
    isHinted,
}: {
    isBottom?: boolean,
    sid: SubstanceId;
    isHinted?: boolean;
}) {
    const act = useCraftingAct();


    return <div style={{
        position: "relative",
        textAlign: "center",
        margin: `-2px 7px 7px 7px`,
        width: `18px`,
        height: `35px`,
        border: "2px dashed #ffffff50",
        borderTopLeftRadius: "3px 6px",
        borderTopRightRadius: "3px 6px",
        borderBottomLeftRadius: "3px 6px",
        borderBottomRightRadius: "3px 6px",
        fontSize: `24px`,
        lineHeight: `38px`,

        ...(sid === undefined ? {} : {
            backgroundColor: substanceColors[sid],
            color: "#ffffffff",
            border: "2px dashed transparent",
        }),

        ...(!isBottom ? {} : {
            borderBottomLeftRadius: "9px",
            borderBottomRightRadius: "9px",
        }),
    }}>
        {sid}
        {isHinted && <div className={css`& {
            z-index: 1;
            position: absolute;
            top: 1px;
            left: 1px;
            bottom: 1px;
            right: 1px;
            border: 2px solid #ffffffa0;
            border-radius: 3px;
            animation-name: ${keyframes`
                0% { transform: scale(1, 1); }
                10% { transform: scale(1.5, 1.5); }
                30% { transform: scale(1, 1); }
                100% { transform: scale(1, 1); }
            `};
            animation-duration: 1300ms;
            animation-fill-mode: both;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
        }`}></div>}
    </div>;
}

export function TubeAsContainer({
    children,
    style,
    className,
    isTarget = false,
    shadow,
}: {
    children: ComponentChildren,
    style?: JSX.CSSProperties;
    className?: string;
    isTarget?: boolean;
    shadow?: ComponentChildren;
}) {
    return <div
        className={cx(className)}
        style={{
            ...flex.colRevS,

            height: `155px`,
            background: "#95A1AD",
            borderBottomLeftRadius: "999px",
            borderBottomRightRadius: "999px",
            overflow: "hidden",

            ...(!isTarget ? {} : {
                background: "#4E6076",
            }),

            ...style,
        }}
    >
        {children}
        {shadow}
    </div>;
}

export function Tube({
    tube,
    ...props
}: {
    tube: SubstanceId[];
    style?: JSX.CSSProperties;
    className?: string;
    shadow?: ComponentChildren;
}) {
    return <TubeAsContainer {...props}>
        <TubeSlot sid={tube[0]} isBottom />
        <TubeSlot sid={tube[1]} />
        <TubeSlot sid={tube[2]} />
    </TubeAsContainer>;
}
