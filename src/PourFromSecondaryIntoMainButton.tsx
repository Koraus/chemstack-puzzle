import { CraftingAction } from "./crafting";
import { JSX } from "preact";
import { cx } from "@emotion/css";
import { buttonCss } from "./buttonCss";
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { craftingActionsRecoil, craftingStateInTimeRecoil } from "./craftingActionsRecoil";
import { ArrowRight } from "@emotion-icons/material-rounded/ArrowRight";
import { useRecoilValue } from "recoil";


export function PourFromSecondaryIntoMainButton({ style, className }: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const updCraftingActions = useUpdRecoilState(craftingActionsRecoil);
    const act = (action: CraftingAction) => updCraftingActions({ $push: [action] });

    const isWin = useRecoilValue(craftingStateInTimeRecoil).state.targets.length === 0;

    return <button
    disabled={isWin}
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
