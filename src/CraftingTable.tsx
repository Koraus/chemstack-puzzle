import update from "immutability-helper";
import { atom, selector, useRecoilValue } from 'recoil';
import { Reaction, SubstanceId } from "./crafting";
import * as flex from "./utils/flex";
import * as _ from "lodash";
import { Tube } from "./Tube";
import { CraftingAction, craftingReduce } from './crafting';
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { reactionsLibraryRecoil } from "./ReactionsLibrary";
import { CraftingTargets, craftingTargetsLeftRecoil, craftingTargetsRecoil } from "./CraftingTargets";
import { isWinRecoil } from "./Win";
import { levelPresetRecoil } from "./LevelList";
import { buttonCss } from "./buttonCss";
import { CraftingIngredientButton } from "./CraftingIngredientButton";
import { CraftingTube } from "./CraftingTube";
import { levelPresets } from "./levelPresets";
import { TouchAppAnimation } from "./TouchAppAnimation";
import { css, cx } from "@emotion/css";
import { JSX } from "preact";
import { Refresh } from '@emotion-icons/material-rounded/Refresh';
import { Add } from '@emotion-icons/material-rounded/Add';
import { Close } from '@emotion-icons/material-rounded/Close';

export const craftingActionsRecoil = atom({
    key: "craftingActions",
    default: [] as CraftingAction[],
});

export const appliedCraftingActionsRecoil = selector({
    key: "appliedCraftingActions",
    get: ({ get }) => {
        const actions = get(craftingActionsRecoil);
        const reactions = get(reactionsLibraryRecoil);
        const targets = get(craftingTargetsRecoil);
        let state: ReturnType<typeof craftingReduce> | undefined;
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            state = craftingReduce(
                { reactions },
                action,
                state?.stateFinal
                ?? { tubes: [[]], targets });
        }
        return state ?? {
            stateFinal: {
                tubes: [[] as SubstanceId[]],
                targets,
            }
        };
    }
});

export const tubesState = selector({
    key: "tubes",
    get: ({ get }) => get(appliedCraftingActionsRecoil).stateFinal.tubes,
})

function CraftingIngredientPanel({
    style, className,
}: {
    style?: JSX.CSSProperties;
    className?: string;
}) {
    const tubes = useRecoilValue(tubesState);
    const { ingredientCount } = useRecoilValue(levelPresetRecoil);
    const ingredients = Array.from({ length: ingredientCount }, (_, i) => i);
    const isFirstLevel = useRecoilValue(levelPresetRecoil).name === levelPresets[0].name;
    const targets = useRecoilValue(craftingTargetsLeftRecoil);

    const hintSid =
        isFirstLevel
        && targets.length > 0
        && tubes[0].every((_, i) => tubes[0][i] === targets[0][i])
        && targets[0][tubes[0].length];

    const touchAppAnimationCss = css`& {
        position: absolute;
        left: 32px;
        bottom: 10px;
    }`;

    return <div
        className={cx(className)}
        style={{ ...style }}
    >
        <div style={{ ...flex.row, flex: 1 }}>
            {ingredients
                .filter((_, i) => !(i > 2))
                .map(sid => <div style={{ position: "relative", }}>
                    <CraftingIngredientButton sid={sid} />
                    {(hintSid === sid) && <TouchAppAnimation className={touchAppAnimationCss} />}
                </div>)}
        </div>
        <div style={{ ...flex.rowRev, flex: 1 }}>
            {ingredients
                .filter((_, i) => (i > 2))
                .map(sid => <div style={{ position: "relative", }}>
                    <CraftingIngredientButton sid={sid} mirrored />
                    {(hintSid === sid) && <TouchAppAnimation className={touchAppAnimationCss} />}
                </div>)}
        </div>
    </div>
}

export function CraftingTable() {
    const craftingActions = useRecoilValue(craftingActionsRecoil);
    const updCraftingActions = useUpdRecoilState(craftingActionsRecoil);
    const act = (action: CraftingAction) => updCraftingActions({ $push: [action] });

    const tubes = useRecoilValue(tubesState);
    const isFirstLevel = useRecoilValue(levelPresetRecoil).name === levelPresets[0].name;
    const targets = useRecoilValue(craftingTargetsLeftRecoil);
    const isWin = useRecoilValue(isWinRecoil);

    const hintReset =
        isFirstLevel
        && targets.length > 0
        && !tubes[0].every((_, i) => tubes[0][i] === targets[0][i]);

    return <div style={{
        backgroundColor: "#f4fff559",
        padding: "8px 10px",
        ...flex.col,
    }}>
        <CraftingIngredientPanel style={{ ...flex.row }} />

        <div style={{
            ...flex.row,
            marginTop: 10,
        }}>
            <div style={{
                ...flex.rowRev,
                position: "relative",
                perspective: "120px",
                perspectiveOrigin: "center 120px",
                transformStyle: "preserve-3d",
                flex: 1,
            }}>
                {tubes.slice(1).map((t, i) => {
                    if (i === 0) { return <Tube isPourable tube={t} />; }
                    const dx = (i - 1) * 23 + 15;
                    const dz = Math.pow((i - 1), 0.4) * 20 + 40;
                    return <Tube
                        style={{
                            position: "absolute",
                            transform: `translate3d(${-dx}px, 0, ${-dz}px)`,
                        }}
                        shadow={<div style={{
                            position: "absolute",
                            top: 0,
                            left: "47%",
                            right: "-47%",
                            bottom: "-5px",
                            background: "#00000040",
                            borderBottomLeftRadius: "999px",
                            borderBottomRightRadius: "999px",
                        }}></div>}
                        tube={t}
                    />;
                })}
            </div>
            <CraftingTube style={{ margin: "-55px 40px -18px" }} />
            <CraftingTargets style={{ flex: 1 }} />
        </div>

        <div style={{ ...flex.row, flex: 1 }}>

            <div style={{ flex: 3 }}>
            </div>
            <div style={{
                flex: 5,
                ...flex.row,
                justifyContent: "space-between",
            }}>
                <button
                    className={buttonCss}
                    style={{
                        ...flex.row,
                        alignItems: "center",
                    }}
                    disabled={isWin || tubes.length > 6}
                    onClick={() => act({ action: "addTube" })}
                >
                    <Add style={{
                        height: "30px",
                        margin: "0 0 0 -6px",
                        zIndex: 1,
                    }} />
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
                        ...flex.row,
                        alignItems: "center",
                    }}
                    disabled={isWin || tubes.length <= 1}
                    onClick={() => act({ action: "trashTube" })}
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
            <div style={{ ...flex.rowRev, flex: 3 }}>
                <button
                    className={buttonCss}
                    style={{
                        ...flex.row,
                        width: 33,
                        color: "#ff7070",
                        position: "relative",
                    }}
                    disabled={isWin || craftingActions.length === 0}
                    onClick={() => updCraftingActions({ $set: [] })}
                >
                    <Refresh style={{ margin: -4 }} />
                    {(hintReset) && <TouchAppAnimation className={css`& {
                        position: absolute;
                        transform: translate(20px, 33px);
                    }`} />}
                </button>
            </div>

        </div>
    </div>;
}

