import { useRecoilValue } from 'recoil';
import * as flex from "./utils/flex";
import * as _ from "lodash";
import { CraftingAction, SubstanceId } from './crafting';
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { CraftingTargets } from "./CraftingTargets";
import { isWinRecoil } from "./Win";
import { levelPresetRecoil } from "./LevelList";
import { buttonCss } from "./buttonCss";
import { CraftingIngredientButton } from "./CraftingIngredientButton";
import { CraftingTube } from "./CraftingTube";
import { TouchAppAnimation } from "./TouchAppAnimation";
import { css, cx } from "@emotion/css";
import { JSX } from "preact";
import { Refresh } from '@emotion-icons/material-rounded/Refresh';
import { Add } from '@emotion-icons/material-rounded/Add';
import { Close } from '@emotion-icons/material-rounded/Close';
import { craftingActionsRecoil, craftingStateInTimeRecoil, getCraftingState } from "./craftingActionsRecoil";
import { tutorialRecoil } from './tutorialRecoil';
import { CraftingSecondaryTubes } from './CraftingSecondaryTubes';

function CraftingIngredientPanel({
    style, className,
}: {
    style?: JSX.CSSProperties;
    className?: string;
}) {
    const tutorial = useRecoilValue(tutorialRecoil);
    const needHint = (sid: SubstanceId) => tutorial.some(t =>
        t.kind === "addIngredient"
        && t.ingredientId === sid);

    const { ingredientCount } = useRecoilValue(levelPresetRecoil);
    const ingredients = Array.from({ length: ingredientCount }, (_, i) => i);

    const touchAppAnimationCss = css`& {
        position: absolute;
        left: 32px;
        bottom: 10px;
    }`;

    return <div
        className={cx(className)}
        style={{ ...style }}
    >
        <div style={{ ...flex.rowS, flex: 1 }}>
            {ingredients
                .filter((_, i) => !(i > 2))
                .map(sid => <div style={{ position: "relative", }}>
                    <CraftingIngredientButton sid={sid} />
                    {needHint(sid) && <TouchAppAnimation className={touchAppAnimationCss} />}
                </div>)}
        </div>
        <div style={{ ...flex.rowRevS, flex: 1 }}>
            {ingredients
                .filter((_, i) => (i > 2))
                .map(sid => <div style={{ position: "relative", }}>
                    <CraftingIngredientButton sid={sid} mirrored />
                    {needHint(sid) && <TouchAppAnimation className={touchAppAnimationCss} />}
                </div>)}
        </div>
    </div>
}

export function CraftingTable() {
    const craftingActions = useRecoilValue(craftingActionsRecoil);
    const updCraftingActions = useUpdRecoilState(craftingActionsRecoil);
    const act = (action: CraftingAction) => updCraftingActions({ $push: [action] });

    const { tubes } =
        getCraftingState(useRecoilValue(craftingStateInTimeRecoil)).state;
    const isWin = useRecoilValue(isWinRecoil);

    const tutorial = useRecoilValue(tutorialRecoil);
    const hintReset = tutorial.some(t => t.kind === "reset");
    const hintAddTube = tutorial.some(t => t.kind === "addTube");

    return <div style={{
        padding: "16px 16px",
        ...flex.colS,
        position: "relative",
    }}>
        <div className={cx(css`& {
            overflow: hidden;
            background: linear-gradient(#142a4a, #00183c);
            border: 5px solid #A2B5DD;
            border-radius: 30px;
            position: absolute;
            perspective: 400px;
            perspective-origin: center 120px;
            transform-style: preserve-3d;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            overflow: hidden;
        }`)}>
            <div className={cx(css`& {
                transform-origin: bottom;
                transform: rotateX(90deg) translate(0, 30%);
                width: 100%;
                height: 100%;
            }`)}>
                <div className={cx(css`& {
                    background: radial-gradient(closest-side, 
                        #ffffffff 1%, 
                        #ffffffe0 2%, 
                        #ffffffc0 4%, 
                        #ffffffa0 8%, 
                        #ffffff80 16%, 
                        #ffffff40 32%, 
                        #ffffff20 64%, 
                        #ffffff00);
                    transform-origin: center;
                    transform: scale(4);
                    width: 100%;
                    height: 100%;
                }`)}>
                </div>
            </div>
        </div>

        <CraftingIngredientPanel style={{ ...flex.rowS, zIndex: 1 }} />

        <div style={{ ...flex.rowS, marginTop: 10 }}>
            <CraftingSecondaryTubes style={{ flex: 1 }} />
            <CraftingTube style={{ margin: "-55px 40px -18px" }} />
            <CraftingTargets style={{ flex: 1 }} />
        </div>

        <div style={{ ...flex.rowS, flex: 1 }}>

            <div style={{ flex: 3 }}>
            </div>
            <div style={{
                flex: 5,
                ...flex.rowS,
                justifyContent: "space-between",
            }}>
                <button
                    className={buttonCss}
                    style={{
                        ...flex.rowS,
                        alignItems: "center",
                        zIndex: 1,
                    }}
                    disabled={isWin || tubes.length > 6}
                    onClick={() => act({ action: "addTube", time: performance.now() })}
                >
                    <Add style={{
                        height: "30px",
                        margin: "0 0 0 -6px",
                        zIndex: 1,
                    }} />
                    {(hintAddTube) && <TouchAppAnimation className={css`& {
                        position: absolute;
                        transform: translate(24px, 21px);
                    }`} />}
                    <div style={{
                        margin: "0 0 0 -11px",
                        width: "10px",
                        height: "26px",
                        backgroundColor: "#cccccc",
                        borderRadius: "0px 0px 999px 999px",
                    }}></div>
                </button>
                <button
                    className={buttonCss}
                    style={{
                        ...flex.rowS,
                        alignItems: "center",
                        zIndex: 1,
                    }}
                    disabled={isWin || tubes.length <= 1}
                    onClick={() => act({ action: "trashTube", time: performance.now() })}
                >
                    <Close style={{
                        height: "30px",
                        margin: "0 0 0 -6px",
                        zIndex: 1,
                        color: "#ff7070",
                    }} />
                    <div style={{
                        margin: "0 0 0 -11px",
                        width: "10px",
                        height: "26px",
                        backgroundColor: "#cccccc",
                        borderRadius: "0px 0px 999px 999px",
                    }}></div>
                </button>
            </div>
            <div style={{ ...flex.rowRevS, flex: 3 }}>
                <button
                    className={buttonCss}
                    style={{
                        ...flex.rowS,
                        width: 33,
                        color: "#ff7070",
                        position: "relative",
                    }}
                    disabled={isWin || craftingActions.length === 0}
                    onClick={() => updCraftingActions({ $set: [] })}
                >
                    <Refresh style={{
                        height: "100%",
                        margin: "0px -4px",
                    }} />
                    {(hintReset) && <TouchAppAnimation className={css`& {
                        position: absolute;
                        transform: translate(20px, 33px);
                    }`} />}
                </button>
            </div>

        </div>
    </div>;
}

