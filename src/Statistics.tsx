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


function Chart({ width, height, currentValue, data }: {
    width: number,
    height: number,
    currentValue: number,
    data: Record<number, {
        all: number,
        unique: number,
    }>
}) {
    const max = Math.max(currentValue, ...Object.keys(data).map(Number));
    const data1 = Array.from({ length: Math.ceil(max * 1.2) + 2 }, (_, i) => [i, data[i]]);
    const x = Plot.plot({
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
            // Plot.barY(data1, {
            //     x: (d: [string, {
            //         all: number,
            //         unique: number,
            //     }]) => d[0],
            //     y: (d: [string, {
            //         all: number,
            //         unique: number,
            //     }]) => d[1]?.all ?? 0,
            // }),
            // Plot.barY(data1, {
            //     x: (d: [string, {
            //         all: number,
            //         unique: number,
            //     }]) => +d[0],
            //     y: (d: [string, {
            //         all: number,
            //         unique: number,
            //     }]) => d[1]?.unique ?? 0,
            // }),
            Plot.ruleX([currentValue], { stroke: "red", strokeWidth: 3, }),
        ]
    });

    return <div dangerouslySetInnerHTML={{ __html: x.outerHTML }}></div>;
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

    const isComplete = Object.values(solution.knownSolutions)
        .some(s => _getProblemCmp(s.problem) === _getProblemCmp(solution.problem));
    if (!isComplete) { return null; }
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
            {remoteStats
                ? <>
                    <div className={css`&{ border: 1px solid #fff3; margin: 1px; padding: 2px; }`}>
                        <div className={css`&{height: 30px}`}>
                            <Spreadsheet className={css`&{height: 100%}`} />
                            {currentStats.actionCount} actions
                        </div>
                        <Chart
                            width={isHorizontal ? 250 : 150}
                            height={isHorizontal ? 65 : 150}
                            currentValue={currentStats.actionCount}
                            data={remoteStats.actionCount ?? {}}
                        />
                    </div>
                    <div className={css`&{ border: 1px solid #fff3; margin: 1px; padding: 2px; }`}>
                        <div className={css`&{height: 30px}`}>
                            <TestTube className={css`&{height: 100%}`} />
                            {currentStats.actionCount} add tubes
                        </div>
                        <Chart
                            width={isHorizontal ? 250 : 150}
                            height={isHorizontal ? 65 : 150}
                            currentValue={currentStats.maxAddedTubeCount}
                            data={remoteStats.maxAddedTubeCount ?? {}}
                        />
                    </div>
                    <div className={css`&{ border: 1px solid #fff3; margin: 1px; padding: 2px; }`}>
                        <div className={css`&{height: 30px}`}>
                            <CoinStack className={css`&{height: 100%}`} />
                            {currentStats.actionCount} coins
                        </div>
                        <Chart
                            width={isHorizontal ? 250 : 150}
                            height={isHorizontal ? 65 : 150}
                            currentValue={currentStats.price}
                            data={remoteStats.price ?? {}}
                        />
                    </div>
                </>
                : "loading..."}
        </div>
    </div>;
}
