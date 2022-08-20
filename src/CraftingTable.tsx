import { useRecoilValue } from 'recoil';
import * as flex from "./utils/flex";
import * as _ from "lodash";
import { CraftingAction } from './crafting';
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { CraftingTargets } from "./CraftingTargets";
import { isWinRecoil } from "./Win";
import { buttonCss } from "./buttonCss";
import { CraftingTube } from "./CraftingTube";
import { TouchAppAnimation } from "./TouchAppAnimation";
import { css, cx } from "@emotion/css";
import { Refresh } from '@emotion-icons/material-rounded/Refresh';
import { Add } from '@emotion-icons/material-rounded/Add';
import { Close } from '@emotion-icons/material-rounded/Close';
import { craftingActionsRecoil, craftingStateInTimeRecoil, useCraftingState } from "./craftingActionsRecoil";
import { tutorialRecoil } from './tutorialRecoil';
import { CraftingSecondaryTubes } from './CraftingSecondaryTubes';
import { GlobalBackground } from './GlobalBackground';
import { CraftingIngredientPanel } from './CraftingIngredientPanel';


export function CraftingTable() {
    const craftingActions = useRecoilValue(craftingActionsRecoil);
    const updCraftingActions = useUpdRecoilState(craftingActionsRecoil);
    const act = (action: CraftingAction) => updCraftingActions({ $push: [action] });

    const  { tubes } = useRecoilValue(craftingStateInTimeRecoil).state;
    const isWin = useRecoilValue(isWinRecoil);

    const tutorial = useRecoilValue(tutorialRecoil);
    const hintReset = tutorial.some(t => t.kind === "reset");
    const hintAddTube = tutorial.some(t => t.kind === "addTube");
    
    const craftingStateInTime = useCraftingState();
    const isCraftingIdle = craftingStateInTime.currentState.id === "craftingIdle";

    return <div style={{
        padding: "16px 16px",
        ...flex.colS,
        position: "relative",
    }}>
        <GlobalBackground className={cx(css`& {
            position: absolute;
            inset: 0;
            z-index: -100;
        }`)} />

        <CraftingIngredientPanel style={{ zIndex: 1 }} />

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
                <button style={{position: "absolute", left: "0"}} 
                         onClick={() => act({ action: "swapTubes", time: performance.now() })}> swapTubes </button>
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
                    {(isCraftingIdle && hintAddTube) && <TouchAppAnimation className={css`& {
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
                    {(isCraftingIdle && hintReset) && <TouchAppAnimation className={css`& {
                        position: absolute;
                        transform: translate(20px, 33px);
                    }`} />}
                </button>
            </div>

        </div>
    </div>;
}

