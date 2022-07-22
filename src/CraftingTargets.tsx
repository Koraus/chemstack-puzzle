import { css, cx } from "@emotion/css";
import { selector, useRecoilState, useRecoilTransaction_UNSTABLE, useRecoilValue } from "recoil";
import { buttonCss } from "./buttonCss";
import { appliedCraftingActionsRecoil, craftingActionsRecoil } from "./CraftingTable";
import { levelPresetRecoil } from "./LevelList";
import { reactionsLibraryRecoil } from "./ReactionsLibrary";
import { Tube, TubeAsContainer } from "./Tube";
import { createRand } from "./utils/createRand";
import * as flex from "./utils/flex";
import { DoubleArrow } from '@emotion-icons/material-rounded/DoubleArrow';
import { levelPresets } from "./levelPresets";
import { isWinRecoil } from "./Win";
import { TouchAppAnimation } from "./TouchAppAnimation";
type CSSProperties = import("preact").JSX.CSSProperties;

export const craftingTargetsRecoil = selector({
    key: "craftingTargets",
    get: ({ get }) => {
        const { seed, targets, substanceCount } = get(levelPresetRecoil);
        const reactions = get(reactionsLibraryRecoil);

        return targets.map(targetSeed => {
            const checkReactivity = true;

            const rand = createRand(seed + "craftingTargets" + targetSeed);
            for (let tryCount = 0; tryCount < 100; tryCount++) {
                const target = [
                    rand.rangeInt(substanceCount),
                    rand.rangeInt(substanceCount),
                    rand.rangeInt(substanceCount),
                ];
                if (!checkReactivity) {
                    return target;
                }
                const applicableReactions1 = reactions.some(ra => ra.reagents[1] === target[1]
                    && ra.reagents[0] === target[0]);
                if (applicableReactions1) { continue; }

                const applicableReactions2 = reactions.some(ra => ra.reagents[1] === target[2]
                    && ra.reagents[0] === target[1]);
                if (applicableReactions2) { continue; }

                return target;
            }
            throw "craftingTargets tryCount limit exceeded";
        });
    }
});

export const craftingTargetsLeftRecoil =  selector({
    key: "craftingTargetsLeft",
    get: ({ get }) => get(appliedCraftingActionsRecoil).stateFinal.targets,
});


function NextLevelButton({ ...props }: { disabled?: boolean }) {
    const setLevelPreset = useRecoilTransaction_UNSTABLE(({ get, set }) => (lp: typeof levelPreset) => {
        set(levelPresetRecoil, lp)
        set(craftingActionsRecoil, []);
    });
    const [levelPreset] = useRecoilState(levelPresetRecoil);
    let currentLevelIndex = levelPresets
        .findIndex(lp => lp.name === levelPreset.name);
    if (currentLevelIndex < 0) {
        currentLevelIndex = 0;
    }
    const nextLevelIndex = (currentLevelIndex + 1) % levelPresets.length;
    const setNextLevel = () => setLevelPreset(levelPresets[nextLevelIndex]);

    return <button
        className={cx(buttonCss)}
        style={{
            margin: `-2px 7px 7px 7px`,
            width: `18px`,
            height: `125px`,
            border: "2px dashed #ffffff50",
            borderColor: "transparent",
            borderTopLeftRadius: "3px 6px",
            borderTopRightRadius: "3px 6px",
            borderBottomLeftRadius: "9px",
            borderBottomRightRadius: "9px",
        }}
        onClick={setNextLevel}
        {...props}
    ><DoubleArrow style={{
        margin: "0 -10px 0 -12px",
    }} />
    </button>
}

export function CraftingTargets({ style, className }: {
    style?: CSSProperties,
    className?: string,
}) {
    const targets = useRecoilValue(craftingTargetsLeftRecoil);
    
    const isFirstLevel = useRecoilValue(levelPresetRecoil).name === levelPresets[0].name;
    const isWin = useRecoilValue(isWinRecoil);
    const hintWin = isFirstLevel && isWin;

    function TubeAt({ i }: { i: number }) {
        const target = targets[i];
        const dx = (i - 1) * 23 + 15;
        const dz = Math.pow((i - 1), 0.4) * 20 + 40;
        const depthProps =
            i > 0
                ? {
                    style: {
                        position: "absolute",
                        transform: `translate3d(${dx}px, 0, ${-dz}px)`,
                    },
                    shadow: <div style={{
                        position: "absolute",
                        top: 0,
                        left: "-47%",
                        right: "47%",
                        bottom: "-5px",
                        background: "#00000060",
                        borderBottomLeftRadius: "999px",
                        borderBottomRightRadius: "999px",
                    }}></div>
                }
                : {};
        return target
            ? <Tube {...depthProps} tube={target} isTarget />
            : <TubeAsContainer {...depthProps} isTarget>
                <NextLevelButton disabled={i > 0} />
            </TubeAsContainer>
    }

    return <div
        className={cx(className)}
        style={{
            ...flex.row,
            ...style,
            position: "relative",
            perspective: "120px",
            perspectiveOrigin: "center 120px",
            transformStyle: "preserve-3d",
        }}
    >
        {targets.map((_, i) => <TubeAt i={i} />)}
        <TubeAt i={targets.length} />
        {(hintWin) && <TouchAppAnimation className={css`& {
            position: absolute;
            transform: translate(20px, 120px);
        }`} />}
    </div>;
}