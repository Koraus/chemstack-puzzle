import { SubstanceId } from "./puzzle/state";
import { CraftingIngredientButton } from "./CraftingIngredientButton";
import { JSX } from "preact";
import { useRecoilValue } from "recoil";
import { tutorialRecoil } from "./tutorialRecoil";
import { TouchAppAnimation } from "./TouchAppAnimation";
import * as flex from "./utils/flex";
import { css, cx } from "@emotion/css";
import { solutionRecoil, useCraftingTransition } from "./solutionRecoil";


export function CraftingIngredientPanel({
    style, className,
}: {
    style?: JSX.CSSProperties;
    className?: string;
}) {
    const { actionTime } = useRecoilValue(solutionRecoil);
    const tutorial = useRecoilValue(tutorialRecoil);
    const needHint = (sid: SubstanceId) => tutorial.find(t =>
        t.kind === "addIngredient"
        && t.ingredientId === sid);

    const { ingredientCount } = useRecoilValue(solutionRecoil).problem;
    const ingredients = Array.from({ length: ingredientCount }, (_, i) => i);

    const touchAppAnimationCss = css`& {
        position: absolute;
        left: 32px;
        bottom: 10px;
    }`;

    const craftingStateInTime = useCraftingTransition();
    const isCraftingIdle = craftingStateInTime.currentState.id === "idle";

    return <div
        className={cx(
            css`& { transform: translate3d(0, 0, 10px); }`,
            className,
        )}
        style={{ ...flex.rowS, ...style }}
    >
        <div style={{ ...flex.rowS, flex: 1 }}>
            {ingredients
                .filter((_, i) => !(i > 2))
                .map(sid => <div style={{ position: "relative", }}>
                    <CraftingIngredientButton sid={sid} />
                    {isCraftingIdle
                        && needHint(sid)
                        && <TouchAppAnimation
                            className={touchAppAnimationCss}
                            startTime={actionTime + (needHint(sid)?.delay || 0)}
                        />}
                </div>)}
        </div>
        <div style={{ ...flex.rowRevS, flex: 1 }}>
            {ingredients
                .filter((_, i) => (i > 2))
                .map(sid => <div style={{ position: "relative", }}>
                    <CraftingIngredientButton sid={sid} mirrored />
                    {isCraftingIdle
                        && needHint(sid)
                        && <TouchAppAnimation
                            className={touchAppAnimationCss}
                            startTime={actionTime + (needHint(sid)?.delay || 0)}
                        />}
                </div>)}
        </div>
    </div>
}