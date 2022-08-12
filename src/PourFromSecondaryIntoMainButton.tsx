import { CraftingAction } from "./crafting";
import { JSX } from "preact";
import { cx } from "@emotion/css";
import { buttonCss } from "./buttonCss";
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { craftingActionsRecoil } from "./craftingActionsRecoil";
import { ArrowRight } from "@emotion-icons/material-rounded/ArrowRight";


export function PourFromSecondaryIntoMainButton({ style, className }: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const updCraftingActions = useUpdRecoilState(craftingActionsRecoil);
    const act = (action: CraftingAction) => updCraftingActions({ $push: [action] });

    return <button
        className={cx(buttonCss, className)}
        style={{
            display: "flex",
            alignItems: "center",
            width: "20px",
            height: "32px",
            ...style,
        }}
        onClick={() => act({ action: "pourFromSecondaryIntoMain", time: performance.now() })}
    >
        <ArrowRight style={{ height: 80, margin: -20 }} />
    </button>;
}
