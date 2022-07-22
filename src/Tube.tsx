import { cx } from "@emotion/css";
import { SubstanceId } from "./crafting";
import { substanceColors } from "./substanceColors";
import * as flex from "./utils/flex";
import { JSX, ComponentChildren } from "preact";

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
    style?: JSX.CSSProperties;
    className?: string;
    isTarget?: boolean;
    shadow?: ComponentChildren;
}) {
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
        {shadow}
    </div>;
}

export function Tube({
    tube,
    ...props
}: {
    tube: SubstanceId[];
    style?: JSX.CSSProperties;
    className?: string,
    isTarget?: boolean;
    shadow?: ComponentChildren;
}) {
    return <TubeAsContainer {...props}>
        <TubeSlot sid={tube[0]} isBottom />
        <TubeSlot sid={tube[1]} />
        <TubeSlot sid={tube[2]} />
    </TubeAsContainer>;
}
