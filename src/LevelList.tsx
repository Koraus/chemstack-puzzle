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
import { CoinStack } from '@emotion-icons/boxicons-solid/CoinStack';
import { TestTube } from '@emotion-icons/remix-fill/TestTube';
import { Spreadsheet } from '@emotion-icons/boxicons-solid/Spreadsheet';
import { solutionRecoil, useSetProblem } from "./solutionRecoil";
import { getProblemCmp } from "./puzzle/problem";
import memoize from "memoizee";
import { tuple } from "./utils/tuple";
import { evaluate } from "./puzzle/evaluate";
import { Solution } from "./puzzle/solution";
import { StatsData, StatsKey } from "./statsClient";

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

const _getProblemCmp = memoize(getProblemCmp, { max: 1000 });

export function LevelList({ style }: { style?: CSSProperties }) {
    const gameProgress = useRecoilValue(gameProgressState);
    const {
        problem: currentProblem,
        knownSolutions,
        confirmedSolutions,
    } = useRecoilValue(solutionRecoil);

    const setLevelPreset = useSetProblem();
    const resetLevelProgress = useRecoilTransaction_UNSTABLE(({ get, set, reset }) => () => {
        reset(solutionRecoil);
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
        const entryProblemId = _getProblemCmp(levelPreset);
        const currentProblemId = _getProblemCmp(currentProblem);

        const levelPresetIndex = problems.findIndex(x => entryProblemId === _getProblemCmp(x));
        const isOpen =
            levelPresetIndex === 0
            || (levelPresetIndex > 0 && (problems[levelPresetIndex - 1].name in gameProgress));

        const isCurrent = entryProblemId === currentProblemId;
        const isComplete = Object.values(knownSolutions)
            .some(s => _getProblemCmp(s.problem) === entryProblemId);

        const entryConfirmedSolutions = Object.entries(confirmedSolutions)
            .map(([solutionId, response]) => tuple(knownSolutions[solutionId], response))
            .filter(([solution]) => _getProblemCmp(solution.problem) === entryProblemId);

        const hasBadge = (solution: Solution, remoteStats: StatsData, key: StatsKey) => {
            const localStats = evaluate(solution).state.stats;
            const minRemoteStat = Math.min(...Object.keys(remoteStats[key]).map(Number));
            return minRemoteStat === localStats[key];
        }

        const hasActionCountBadge =
            entryConfirmedSolutions.some(([solution, response]) =>
                hasBadge(solution, response.data, "actionCount"));

        const hasMaxAddedTubeCountBadge =
            entryConfirmedSolutions.some(([solution, response]) =>
                hasBadge(solution, response.data, "maxAddedTubeCount"));

        const hasPriceBadge =
            entryConfirmedSolutions.some(([solution, response]) =>
                hasBadge(solution, response.data, "price"));

        const __DEBUG_allowAnyLevel = true && import.meta.env.DEV;
        return <a
            style={{
                ...flex.rowS,
                padding: "6px 3px",
                textDecoration: "none",
                textTransform: "uppercase",
                color: "grey",
                fontSize: 20,
                lineHeight: 1.5,
                width: 200,
                height: 28,

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
            {isComplete && <>
                <Spreadsheet className={css`& { 
                    color: ${hasActionCountBadge ? "#a8d26b" : "#aaa"};
                    height: 50%;
                }`} />
                <TestTube className={css`& { 
                    color: ${hasMaxAddedTubeCountBadge ? "#a8d26b" : "#aaa"};
                    height: 50%;
                }`} />
                <CoinStack className={css`& { 
                    color: ${hasPriceBadge ? "#a8d26b" : "#aaa"};
                    height: 50%;
                }`} />
                <Done className={css`& { color: #a8d26b; height: 100%; } `} />
            </>}

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
