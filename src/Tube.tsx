import { cx } from "@emotion/css";
import { CraftingAction, SubstanceId } from "./crafting";
import { substanceColors } from "./substanceColors";
import * as flex from "./utils/flex";
import { JSX, ComponentChildren } from "preact";
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { buttonCss } from "./buttonCss";
import { ArrowRight } from "@emotion-icons/material-rounded/ArrowRight";
import { craftingActionsRecoil } from "./CraftingTable";

function TubeSlot({
    isBottom,
    isPourable,
    sid,
}: {
    isBottom?: boolean,
    isPourable?: boolean,
    sid: SubstanceId;
}) {
    const updCraftingActions = useUpdRecoilState(craftingActionsRecoil);
    const act = (action: CraftingAction) => updCraftingActions({ $push: [action] });


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
        {isPourable && <div style={{ 
            position: "absolute", 
        }}>
            <button
                className={cx(buttonCss)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    position: "fixed",
                    width: "20px",
                    height: "32px",
                    margin: "-36px 0px 0px 17px",
                }}
                onClick={() => act({ action: "pourFromSecondaryIntoMain" })}
            ><ArrowRight style={{ height: 80, margin: -20 }} /></button>
        </div>}
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
            ...flex.colRev,

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
    isPourable,
    ...props
}: {
    tube: SubstanceId[];
    style?: JSX.CSSProperties;
    className?: string,
    isTarget?: boolean;
    isPourable?: boolean;
    shadow?: ComponentChildren;
}) {
    return <TubeAsContainer {...props}>
        <TubeSlot
            sid={tube[0]}
            isPourable={isPourable && 1 === tube.length}
            isBottom />
        <TubeSlot
            sid={tube[1]}
            isPourable={isPourable && 2 === tube.length} />
        <TubeSlot
            sid={tube[2]}
            isPourable={isPourable && 3 === tube.length} />
    </TubeAsContainer>;
}
