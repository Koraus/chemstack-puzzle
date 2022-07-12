import { SubstanceId } from "./LevelEditor";
import { substanceColors } from "./substanceColors";
import * as flex from "./utils/flex";


export function Tube({
    tube, style, isTarget = false, w = 16, isActive = false,
}: {
    tube: SubstanceId[];
    style?: preact.JSX.CSSProperties;
    isTarget?: boolean;
    isActive?: boolean;
    w?: number;
}) {
    function Slot({ i }: { i: number; }) {
        return <div style={{
            textAlign: "center",
            margin: `${-w * 0.125}px ${w * 0.25}px ${w * 0.25}px ${w * 0.25}px`,
            width: `${w}px`,
            height: `${w * 1.25}px`,
            border: "2px dashed #ffffff50",
            borderRadius: "2px",
            fontSize: `${w * 0.8}px`,
            fontFamily: "Bahnschrift",
            lineHeight: `${w * 1.4}px`,
            color: "#ffffff50",
            backgroundColor: "#ffffff08",

            ...(i >= tube.length ? {} : {
                backgroundColor: substanceColors[tube[i]],
                color: "#ffffffff",
                borderColor: "transparent",
            }),

            ...(i !== 0 ? {} : {
                borderBottomLeftRadius: "999px",
                borderBottomRightRadius: "999px",
            }),
        }}>{i === tube.length ? (isActive ? "+" : undefined) : tube[i]}</div>;
    }

    return <div style={{
        ...flex.colRev,

        height: `${w * 6}px`,
        background: "#ffffff4d",
        borderBottomLeftRadius: "999px",
        borderBottomRightRadius: "999px",
        margin: "4px",

        ...(!isTarget ? {} : {
            background: "#00000040",
        }),

        ...style,
    }}>
        <Slot i={0} />
        <Slot i={1} />
        <Slot i={2} />
    </div>;
}
