import { CraftingAction } from "./crafting";
import { JSX } from "preact";
import { css, cx } from "@emotion/css";
import { buttonCss } from "./buttonCss";
import { ArrowLeft } from "@emotion-icons/material-rounded/ArrowLeft";
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { craftingActionsRecoil, craftingStateInTimeRecoil } from "./craftingActionsRecoil";
import { TouchAppAnimation } from "./TouchAppAnimation";
import { tutorialRecoil } from "./tutorialRecoil";
import { useRecoilValue } from "recoil";

export function PourFromMainIntoSecondaryButton({ style, className }: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const updCraftingActions = useUpdRecoilState(craftingActionsRecoil);
    const act = (action: CraftingAction) => updCraftingActions({ $push: [action] });

    const isWin = useRecoilValue(craftingStateInTimeRecoil).state.targets.length === 0;

    const tutorial = useRecoilValue(tutorialRecoil);
    const isHinted = tutorial.some(t => t.kind === "pourFromMainIntoSecondary");

    return <button
        disabled={isWin}
        className={cx(buttonCss, className)}
        style={{
            display: "flex",
            position: "relative",

            alignItems: "center",
            width: "23px",
            height: "40px",
            ...style,
        }}
        onClick={() => act({ action: "pourFromMainIntoSecondary", time: performance.now() })}
    >
        <ArrowLeft style={{ height: 80, margin: -20 }} />
        {(isHinted) && <TouchAppAnimation className={css`& {
            position: absolute;
            transform: translate(12px, 22px);
        }`} />}
    </button>;
}
