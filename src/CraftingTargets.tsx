import { css, cx, keyframes } from "@emotion/css";
import { useRecoilState, useRecoilTransaction_UNSTABLE, useRecoilValue } from "recoil";
import { buttonCss } from "./buttonCss";
import { levelPresetRecoil } from "./LevelList";
import * as flex from "./utils/flex";
import { DoubleArrow } from '@emotion-icons/material-rounded/DoubleArrow';
import { levelPresets } from "./levelPresets";
import { TouchAppAnimation } from "./TouchAppAnimation";
import { craftingActionsRecoil, useCraftingState } from "./craftingActionsRecoil";
import { tutorialRecoil } from "./tutorialRecoil";
import { JSX } from "preact";
import { TubeSvg } from "./TubeSvg";

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

function Tube({ revI, ...props }: {
    revI: number;
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const craftingStateInTime = useCraftingState();
    const now = craftingStateInTime.currentTime;
    const craftingState = craftingStateInTime.currentState;

    const prevTube = [...craftingState.prevState.targets].reverse()[revI];
    const tube = [...craftingState.state.targets].reverse()[revI];
    const i = craftingState.prevState.targets.length - 1 - revI;

    return <div
        className={cx(
            css`& {
                position: relative;
                width: 37px;
            }`,
            props.className)
        }
        style={props.style}
    >
        <TubeSvg
            svgIdPrefix={`TargetTubeLast${revI}`}
            noBorder
            className={cx(
            )}
            tubeTransition={{
                prevState: prevTube ?? [],
                state: tube ?? [],
                start: craftingState.start,
                duration: craftingState.duration,
                desc: { id: "prev" },
            }}
            now={now}
        />
        {i > 0 && <div className={cx(css`& {
            position: absolute;
            inset: 0 0 0 0;
            border-bottom-left-radius: 999px;
            border-bottom-right-radius: 999px;
            overflow: hidden;
        }`)}>
            <div style={{
                position: "absolute",
                top: 0,
                right: "47%",
                width: "100%",
                bottom: "-5px",
                background: "#00000030",
                borderBottomLeftRadius: "999px",
                borderBottomRightRadius: "999px",
            }}></div>
        </div>}
    </div>;
}

export function CraftingTargets({ style, className }: {
    style?: JSX.CSSProperties,
    className?: string,
}) {
    const craftingStateInTime = useCraftingState();
    const now = craftingStateInTime.currentTime;
    const craftingState = craftingStateInTime.currentState;
    const { start, duration } = craftingState;

    const tutorial = useRecoilValue(tutorialRecoil);
    const hintNext = tutorial.some(t => t.kind === "next");

    const tubes = craftingState.state.targets;
    const prevTubes = craftingState.prevState.targets;

    const stubTubes = Array.from({ length: Math.max(tubes.length, prevTubes.length) });

    // todo bring hints back!!!
    // function TubeAt({ i }: { i: number }) {
    //     const isHinted = (slotIndex: number) =>
    //         i === 0
    //         && tutorial.some(t =>
    //             t.kind === "target"
    //             && t.slotIndex === slotIndex);

    //             <TubeSlot
    //                 isHinted={isHinted(0)}
    //                 isBottom />
    //             <TubeSlot
    //                 isHinted={isHinted(1)}
    //             <TubeSlot
    //                 isHinted={isHinted(2)}
    // }

    const _dz = (i: number) =>
        i === -1 ? 41 : (i === 0 ? 0 : -(Math.pow((i - 1), 0.4) * 20 + 40));
    const _dy = (i: number) =>
        i === -1 ? 5 : 0;
    const _dx = (i: number) =>
        i === -1 ? 43 : (i === 0 ? 0 : -(i * 23 - 8));

    return <div
        className={cx(className)}
        style={{
            ...flex.rowS,
            ...style,
            position: "relative",
            perspective: "120px",
            perspectiveOrigin: "center 120px",
            transformStyle: "preserve-3d",
        }}
    >
        {stubTubes.map((_, i, arr) => {

            const x = -_dx(i);
            const y = _dy(i);
            const z = _dz(i);
            const dx = -_dx(i - 1) - x;
            const dy = _dy(i - 1) - y;
            const dz = _dz(i - 1) - z;

            const revI = arr.length - 1 - i;
            return <div
                key={revI}
                className={cx(css`& {
                position: absolute;
                transform: translate3d(${x}px, ${y}px, ${z}px);
                transform-style: preserve-3d;
            }`)}
            >
                <Tube
                    revI={revI}
                    className={cx(
                        craftingState.id === 'craftingGiveaway'
                        && i > 0
                        && css`& {
                            animation: ${keyframes`
                                50% { transform: translate3d(0px, 0px, 0px); }
                                100% { transform: translate3d(${dx}px, ${dy}px, ${dz}px); }
                            `} ${duration}ms ${start - now}ms both linear;
                        } `,
                        craftingState.id === 'craftingGiveaway'
                        && i === 0
                        && css`& {
                            animation: ${keyframes`
                                0%, 3 { transform: translateY(0); }
                                10% { transform: translateY(-12%); }
                                15%, 58% { transform: translateY(-10%); opacity: 1; }
                                60% { transform: translateY(-8%); }
                                62% { transform: translateY(-10%); }
                                100% { transform: translateY(-25%); opacity: 0; }
                            `} ${duration}ms ${start - now}ms both linear;
                        }`,
                    )}
                />
            </div>;
        })}
        <div
            style={{
                ...flex.colRevS,

                height: `155px`,
                background: "#4E6076",
                borderBottomLeftRadius: "999px",
                borderBottomRightRadius: "999px",
                overflow: "hidden",
            }}
            className={cx(
                css`& {
                    position: absolute;
                    transform: translate3d(${-_dx(stubTubes.length)}px, 0, ${_dz(stubTubes.length)}px);
                }`,
                craftingState.id === 'craftingGiveaway'
                && css`& {
                    animation: ${keyframes`
                        50% { transform: translate3d(${-_dx(stubTubes.length)}px, 0, ${_dz(stubTubes.length)}px); }
                        100% { transform: translate3d(${-_dx(stubTubes.length - 1)}px, 0, ${_dz(stubTubes.length - 1)}px); }
                    `} ${duration}ms ${start - now}ms both linear;
                } `,
            )}
        >
            <NextLevelButton disabled={stubTubes.length > 0} />
            {stubTubes.length > 0 && <div style={{
                position: "absolute",
                top: 0,
                left: "-47%",
                right: "47%",
                bottom: "-5px",
                background: "#00000030",
                borderBottomLeftRadius: "999px",
                borderBottomRightRadius: "999px",
            }}></div>}
        </div>
        {(hintNext) && <TouchAppAnimation className={css`& {
            position: absolute;
            transform: translate(20px, 120px);
        }`} />}
    </div>;
}