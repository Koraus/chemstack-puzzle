import { useRecoilValue } from 'recoil';
import { JSX } from "preact";
import { useState, useEffect } from "preact/hooks";
import { craftingActionsRecoil, useCraftingState } from './craftingActionsRecoil';
import { css, cx } from '@emotion/css';
import { levelPresetRecoil } from './LevelList';
import { StatsData, getStats, postSolution } from './statsClient';

// @ts-ignore no typings
import * as Plot from "@observablehq/plot";


function Chart({ currentValue, data }: {
    currentValue: number,
    data: Record<number, {
        all: number,
        unique: number,
    }>
}) {
    const max = Math.max(...Object.keys(data).map(Number));
    const data1 = Array.from({ length: max + 2 }, (_, i) => [i, data[i]]);
    const x = Plot.plot({
        width: 200,
        height: 200,
        style: {
            background: "transparent",
        },
        marks: [
            Plot.barY(data1, {
                x: (d: [string, {
                    all: number,
                    unique: number,
                }]) => d[0],
                y: (d: [string, {
                    all: number,
                    unique: number,
                }]) => d[1]?.all ?? 0,
            }),
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

export function Statistics({
    className,
    ...props
}: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const levelPreset = useRecoilValue(levelPresetRecoil);
    const actions = useRecoilValue(craftingActionsRecoil);
    const craftingStateInTime = useCraftingState();
    const [remoteStats, setRemoteStats] = useState<StatsData>();
    const isWin = craftingStateInTime.state.targets.length === 0;
    useEffect(() => {
        let isCancelled = false;
        (async () => {
            const remoteStats = await getStats(levelPreset);
            if (isCancelled) { return; }
            setRemoteStats(remoteStats);
        })();
        () => isCancelled = true;
    }, [levelPreset]);
    useEffect(() => {
        if (!isWin) { return; }
        let isCancelled = false;
        (async () => {
            const res = await postSolution(levelPreset, actions);
            if (isCancelled) { return; }
            setRemoteStats(res.data);
        })();
        () => isCancelled = true;
    }, [isWin]);
    return <div
        className={cx(
            css`&{ color: white; }`,
            className,
        )}
        {...props}
    >
        <div>
            Action count: {actions.length}

        </div>
        <div>
            {remoteStats
                ? <Chart currentValue={actions.length} data={remoteStats.actionCount} />
                : "loading..."}
        </div>
    </div>;
}
