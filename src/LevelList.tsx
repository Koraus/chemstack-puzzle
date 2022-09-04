import { atom, useRecoilTransaction_UNSTABLE, useRecoilValue } from "recoil";
import { apipe } from "./utils/apipe";
import * as it from "./utils/it";
import { useEffect, useRef } from "preact/hooks";
import { problems } from "./puzzle/problems";
import { buttonCss } from "./buttonCss";
import * as flex from "./utils/flex";
import { css, cx } from "@emotion/css";
type CSSProperties = import("preact").JSX.CSSProperties;
import { Done } from '@emotion-icons/material-rounded/Done';
import { RemoveDone } from '@emotion-icons/material-rounded/RemoveDone';
import { solutionRecoil, useSetProblem } from "./solutionRecoil";

export const gameProgressState = atom({
    key: "gameProgress",
    default: {} as Record<string, boolean>,
    effects: [({ node, setSelf, onSet }) => {
        const key = node.key;
        const savedValue = localStorage.getItem(key)
        if (savedValue != null) {
            const __DEBUG_setAllLevels = false && import.meta.env.DEV;

            if (__DEBUG_setAllLevels) {
                setSelf(Object.fromEntries(apipe(problems,
                    it.map(p => [p.name, true] as const),
                )));
            } else {
                setSelf(JSON.parse(savedValue));
            }
        }

        onSet((newValue, _, isReset) => {
            isReset
                ? localStorage.removeItem(key)
                : localStorage.setItem(key, JSON.stringify(newValue));
        });
    }],
});


export function LoadHighestLevelEffect() {
    const gameProgress = useRecoilValue(gameProgressState);
    const setLevelPreset = useSetProblem();

    useEffect(() => {
        const highestProgressedIndex = Object.keys(gameProgress)
            .map(name => problems.findIndex(x => x.name === name))
            .sort((a, b) => b - a)[0] ?? -1;
        setLevelPreset(problems[Math.min(
            highestProgressedIndex + 1,
            problems.length - 1)]);
    }, []);

    return <></>;
}

export function LevelList({ style }: { style?: CSSProperties }) {
    const gameProgress = useRecoilValue(gameProgressState);
    const currentLevelPreset = useRecoilValue(solutionRecoil).problem;
    const setLevelPreset = useSetProblem();
    const resetLevelProgress = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        set(solutionRecoil, {
            problem: problems[0],
            actions: [],
            actionTime: 0,
            currentTime: 0,
        });
        set(gameProgressState, {});
    });

    const scrollToRef = useRef<HTMLAnchorElement>(null);
    useEffect(
        () => scrollToRef.current?.scrollIntoView({ block: "center" }),
        []);

    function Entry({
        levelPreset
    }: {
        levelPreset: typeof problems[0]
    }) {
        const levelPresetIndex = problems.findIndex(x => x.name === levelPreset.name);
        const isCurrent = levelPreset.name === currentLevelPreset.name;
        const isComplete =
            (levelPresetIndex >= 0)
            && (problems[levelPresetIndex].name in gameProgress);
        const isOpen =
            levelPresetIndex === 0
            || (levelPresetIndex > 0 && (problems[levelPresetIndex - 1].name in gameProgress));
        const __DEBUG_allowAnyLevel = true && import.meta.env.DEV;
        return <a
            style={{
                ...flex.rowS,
                padding: "6px 3px",
                textDecoration: "none",
                textTransform: "uppercase",
                color: "grey",
                fontSize: 20,
                width: 200,

                ...(isOpen && {
                    color: "white"
                }),

                ...(isCurrent && {
                    backgroundColor: "#ffffff50",
                }),
            }}
            {...((isOpen || __DEBUG_allowAnyLevel) && {
                href: "#",
                onClick: () => setLevelPreset(levelPreset)
            })}
            {...isCurrent && {
                ref: scrollToRef,
            }}
        >
            <span
                style={{
                    flexGrow: 1,
                    overflowX: "hidden",
                    whiteSpace: "nowrap",
                }}
            >{levelPreset.name}</span>
            {isComplete && <Done className={css`& {
                color: #a8d26b;
                height: 28px;
            } `} />}

        </a>;
    }

    return <div
        style={{
            position: "relative",
            padding: "3px 0px",
            ...style,
        }}
    >
        <div style={{
            overflowY: "scroll",
            height: "100%",
        }}>{problems.map(levelPreset => <Entry {...{ levelPreset }} />)}</div>

        <button
            className={buttonCss}
            style={{
                position: "absolute",
                right: "18px",
                bottom: "8px",
                height: "40px",
                width: "40px",
                color: "red"
            }}
            onClick={() =>
                confirm('Progress will be lost! Click "Ok" to confirm')
                && resetLevelProgress()
            }
        >
            <RemoveDone style={{ height: "100%" }} />
        </button>
    </div>
};
