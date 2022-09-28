import { useRecoilValue } from 'recoil';
import { JSX } from "preact";
import { useState, useEffect } from "preact/hooks";
import { solutionRecoil, useCraftingTransition } from './solutionRecoil';
import { css, cx } from '@emotion/css';
import { StatsData, getStats } from './statsClient';
import { getSolutionCmp } from './puzzle/solution';
import * as flex from "./utils/flex";
import { CoinStack } from '@emotion-icons/boxicons-solid/CoinStack';
import { TestTube } from '@emotion-icons/remix-fill/TestTube';
import { Spreadsheet } from '@emotion-icons/boxicons-solid/Spreadsheet';
import { getProblemCmp } from "./puzzle/problem";
import memoize from "memoizee";

// @ts-ignore no typings
import * as Plot from "@observablehq/plot";
import { evaluate } from './puzzle/evaluate';
import { tuple } from './utils/tuple';


function Chart({ width, height, currentValue, bestValue, data, ...props }: {
    width: number,
    height: number,
    currentValue: number,
    bestValue: number | undefined,
    data: Record<number, {
        all: number,
        unique: number,
    }>,
    className?: string,
    style?: JSX.CSSProperties,
}) {
    const max = Math.max(currentValue, ...Object.keys(data).map(Number));
    const plot = Plot.plot({
        width,
        height,
        marginLeft: 8,
        marginRight: 8,
        marginTop: 6,
        marginBottom: 16,
        style: {
            background: "transparent",
        },
        x: {
            domain: [-0.5, max + 2.5],
            grid: true,
            line: true,
            ticks: (max + 2) >= 10 ? 10 : (max + 2),
        },
        y: {
            line: true,
            ticks: 0,
        },
        marks: [

            Plot.rectY(
                Object.entries(data), {
                x1: (d: [string, {
                    all: number,
                    unique: number,
                }]) => +d[0] - 0.5,
                x2: (d: [string, {
                    all: number,
                    unique: number,
                }]) => +d[0] + 0.5,
                y1: (d: [string, {
                    all: number,
                    unique: number,
                }]) => d[1]?.all ?? 0,
                y2: 0,
            }),
            Plot.ruleX([currentValue], { stroke: "red", strokeWidth: 3, }),
            Plot.ruleX([bestValue], { stroke: "#f004", strokeWidth: 3, }),
        ]
    });

    return <div
        dangerouslySetInnerHTML={{ __html: plot.outerHTML }}
        {...props}
    ></div>;
}

const _getProblemCmp = memoize(getProblemCmp, { max: 1000 });

export function Statistics({
    isHorizontal, className, ...props
}: {
    isHorizontal?: boolean;
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const solution = useRecoilValue(solutionRecoil);
    const craftingStateInTime = useCraftingTransition();
    const [remoteStats, setRemoteStats] = useState<StatsData>();
    const submissionStats = solution.confirmedSolutions[getSolutionCmp(solution)];
    useEffect(() => {
        setRemoteStats(submissionStats?.data);
        let isCancelled = false;
        (async () => {
            const remoteStats = await getStats(solution.problem);
            if (isCancelled) { return; }
            setRemoteStats(remoteStats);
        })();
        () => isCancelled = true;
    }, [solution.problem]);
    useEffect(() => {
        if (!submissionStats) { return; }
        setRemoteStats(submissionStats.data);
    }, [submissionStats]);
    const currentStats = craftingStateInTime.currentState.state.stats;

    const { confirmedSolutions, knownSolutions, problem } = solution;
    const currentConfirmedSolutions = Object.entries(confirmedSolutions)
        .map(([solutionId, response]) => tuple(knownSolutions[solutionId], response))
        .filter(([solution]) => _getProblemCmp(solution.problem) === _getProblemCmp(problem));

    const currentConfirmedStats = currentConfirmedSolutions
        .map(([s]) => evaluate(s).state.stats);

    const currentBestStats = {
        actionCount: Math.min(...currentConfirmedStats.map(s => s.actionCount)),
        maxAddedTubeCount: Math.min(...currentConfirmedStats.map(s => s.maxAddedTubeCount)),
        price: Math.min(...currentConfirmedStats.map(s => s.price)),
    }

    const isComplete = Object.values(solution.knownSolutions)
        .some(s => _getProblemCmp(s.problem) === _getProblemCmp(solution.problem));
    return <div
        className={cx(
            css`&{ color: white; }`,
            className,
        )}
        {...props}
    >
        <div className={cx(
            isHorizontal ? flex.col : flex.row,
        )}>
            <div className={css`&{ 
                margin: 1px; 
                padding: 2px; 
            }`}>
                <div className={css`&{height: 22px;}`}>
                    <Spreadsheet className={css`&{height: 100%}`} />
                    {currentStats.actionCount} actions
                </div>
                <Chart
                    className={cx(css`&{ 
                        ${(isComplete && remoteStats) ? "" : "visibility: hidden;"}
                        border: 1px solid #fff3; 
                    }`)}
                    width={isHorizontal ? 250 : 150}
                    height={isHorizontal ? 65 : 150}
                    currentValue={currentStats.actionCount}
                    bestValue={currentBestStats.actionCount}
                    data={remoteStats?.actionCount ?? {}}
                />
            </div>
            <div className={css`&{ 
                    margin: 1px; 
                    padding: 2px; 
                }`}>
                <div className={css`&{height: 22px;}`}>
                    <TestTube className={css`&{height: 100%}`} />
                    {currentStats.maxAddedTubeCount} tubes
                </div>
                <Chart
                    className={cx(css`&{
                        ${(isComplete && remoteStats) ? "" : "visibility: hidden;"}
                        border: 1px solid #fff3;
                    }`)}
                    width={isHorizontal ? 250 : 150}
                    height={isHorizontal ? 65 : 150}
                    currentValue={currentStats.maxAddedTubeCount}
                    bestValue={currentBestStats.maxAddedTubeCount}
                    data={remoteStats?.maxAddedTubeCount ?? {}}
                />
            </div>
            <div className={css`&{ 
                    margin: 1px; 
                    padding: 2px; 
                }`}>
                <div className={css`&{height: 22px;}`}>
                    <CoinStack className={css`&{height: 100%}`} />
                    {currentStats.price} coins
                </div>
                <Chart
                    className={cx(css`&{ 
                        ${(isComplete && remoteStats) ? "" : "visibility: hidden;"}
                        border: 1px solid #fff3; 
                    }`)}
                    width={isHorizontal ? 250 : 150}
                    height={isHorizontal ? 65 : 150}
                    currentValue={currentStats.price}
                    bestValue={currentBestStats.price}
                    data={remoteStats?.price ?? {}}
                />
            </div>
        </div>
    </div>;
}
