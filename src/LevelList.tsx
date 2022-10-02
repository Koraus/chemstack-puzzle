import { useRecoilValue, useResetRecoilState } from "recoil";
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

const _getProblemCmp = memoize(getProblemCmp, { max: 1000 });

export function LevelList({ style }: { style?: CSSProperties }) {
    const {
        problem: currentProblem,
        knownSolutions,
        confirmedSolutions,
    } = useRecoilValue(solutionRecoil);

    const setLevelPreset = useSetProblem();
    const resetLevelProgress = useResetRecoilState(solutionRecoil);

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

        const isCurrent = entryProblemId === currentProblemId;
        const isComplete = Object.values(knownSolutions)
            .some(s => _getProblemCmp(s.problem) === entryProblemId);

        const isOpen = (() => {
            const levelPresetIndex =
                problems.findIndex(x => entryProblemId === _getProblemCmp(x));
            if (levelPresetIndex === 0) { return true; }

            const prevProblemId = _getProblemCmp(problems[levelPresetIndex - 1]);
            const isPrevComplete = Object.values(knownSolutions)
                .some(s => _getProblemCmp(s.problem) === prevProblemId);
            return isPrevComplete;
        })();



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
                fontSize: 21,
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
