import { cx } from "@emotion/css";
import { SubstanceId } from "./crafting";
import { substanceColors } from "./substanceColors";
import * as flex from "./utils/flex";
type CSSProperties = import("preact").JSX.CSSProperties;
type ComponentChildren = import("preact").ComponentChildren;

function TubeSlot({
    isBottom,
    sid,
}: {
    isBottom?: boolean,
    sid: SubstanceId;
}) {
    return <div style={{
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
        fontFamily: "Bahnschrift",
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
    }}>{sid}</div>;
}

export function TubeAsContainer({
    children,
    style,
    className,
    isTarget = false,
    shadow,
}: {
    children: ComponentChildren,
    style?: CSSProperties;
    className?: string,
    isTarget?: boolean;
    shadow?: number;
}) {
    if (shadow !== undefined) {
        shadow = isTarget ? shadow : -shadow;
    }
    return <div
        className={cx(className)}
        style={{
            ...flex.colRev,

            height: `155px`,
            background: "#95A1AD",
            borderBottomLeftRadius: "999px",
            borderBottomRightRadius: "999px",
            position: "relative",
            overflow: "hidden",

            ...(!isTarget ? {} : {
                background: "#4E6076",
            }),

            ...style,
        }}
    >
        {children}
        {shadow !== undefined && <div style={{
            position: "absolute",
            top: 0,
            left: `${-shadow * 100}%`,
            bottom: "-5px",
            right: `${shadow * 100}%`,
            background: "#00000060",
            borderBottomLeftRadius: "999px",
            borderBottomRightRadius: "999px",
        }}></div>}
    </div>;
}

export function Tube({
    tube,
    ...props
}: {
    tube: SubstanceId[];
    style?: CSSProperties;
    className?: string,
    isTarget?: boolean;
    shadow?: number;
}) {
    return <TubeAsContainer {...props}>
        <TubeSlot sid={tube[0]} isBottom />
        <TubeSlot sid={tube[1]} />
        <TubeSlot sid={tube[2]} />
    </TubeAsContainer>;
}
