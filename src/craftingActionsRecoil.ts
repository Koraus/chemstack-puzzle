import { atom } from "recoil";
import { Action, actions } from "./puzzle/actions";
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "preact/hooks";
import { problems } from "./puzzle/problems";
import { evaluate, Solution } from "./puzzle/evaluate";
import * as amplitude from "@amplitude/analytics-browser";

export const solutionRecoil = atom({
    key: "solution",
    default: {
        problem: problems[0],
        actions: [] as Solution['actions'],
        actionTime: 0,
        currentTime: 0,
    },
    effects: [
        ({ onSet, setSelf }) => {
            const handles = [] as ReturnType<typeof setTimeout>[];

            onSet(async (newValue, oldValue) => {
                handles.map(clearTimeout);

                const setTime = (currentTime: number) => setSelf({
                    ...newValue,
                    currentTime,
                });

                if (!("problem" in oldValue) || (newValue.problem !== oldValue.problem)) {

                    // legacy log
                    amplitude.track(`levelPreset.onSet`, newValue.problem);

                    amplitude.track(`problem changed`, newValue.problem);
                }

                setTime(performance.now());
                const timeLocal = performance.now();

                const transition = evaluate(newValue);
                if (!("children" in transition)) { return; }

                const levelPresetIndex = problems.findIndex(x => x.name === newValue.problem.name);
                const animationDurationFactor = 1 + 1 / (levelPresetIndex / 2 + 1);

                let t = newValue.actionTime;
                for (const s of transition.children) {
                    const factoredDuration = s.duration * animationDurationFactor;
                    t += factoredDuration;
                    if (timeLocal < t) {
                        const h = setTimeout(
                            () => setTime(performance.now()),
                            t - timeLocal + 10);
                        handles.push(h);
                    }
                }
            });

            () => handles.map(clearTimeout);
        }
    ]
});

export const useSetProblem = () => {
    const upd = useUpdRecoilState(solutionRecoil);
    return (problem: typeof problems[0]) => upd({
        problem: { $set: problem },
        actions: { $set: [] },
        actionTime: { $set: performance.now() },
    });
}

export const useSetNextProblem = () => {
    const { problem } = useRecoilValue(solutionRecoil);
    const setProblem = useSetProblem();
    let currentLevelIndex = problems
        .findIndex(lp => lp.name === problem.name);
    if (currentLevelIndex < 0) {
        currentLevelIndex = 0;
    }
    const nextLevelIndex = (currentLevelIndex + 1) % problems.length;
    return () => setProblem(problems[nextLevelIndex]);
}

export const useCraftingAct = () => {
    const upd = useUpdRecoilState(solutionRecoil);
    return <T extends keyof typeof actions>(action: Action<T>) => upd({
        actions: { $push: [action] },
        actionTime: { $set: performance.now() },
    });
}

export const useCraftingCanReset = () => {
    const { actions } = useRecoilValue(solutionRecoil);
    return actions.length > 0;
}

export const useCraftingReset = () => {
    const upd = useUpdRecoilState(solutionRecoil);
    return () => upd({
        actions: { $set: [] },
        actionTime: { $set: performance.now() },
    });
}

const getCraftingState = (
    transition: ReturnType<typeof evaluate>,
    actionTime: number,
    time: number,
    animationDurationFactor: number,
) => {
    if (!("prevState" in transition)) {
        return {
            id: "idle" as const,
            prevState: transition.state,
            state: transition.state,
            diff: {},
            start: 0,
            duration: 0,
        }
    }
    let t = actionTime;
    for (const s of transition.children) {
        const factoredDuration = s.duration * animationDurationFactor;
        t += factoredDuration;
        if (time < t) {
            return {
                ...s,
                duration: factoredDuration,
                start: t - factoredDuration,
            };
        }
    }
    return {
        id: "idle" as const,
        prevState: transition.state,
        state: transition.state,
        diff: {},
        start: t,
        duration: 0,
    }
}

export function useCraftingState() {
    const { problem, actionTime, actions } = useRecoilValue(solutionRecoil);
    const transition = evaluate({ problem, actions });

    const levelPresetIndex = problems.findIndex(x => x.name === problem.name);
    const animationDurationFactor = 1 + 1 / (levelPresetIndex / 2 + 1);

    const [time, setTime] = useState(0);
    useEffect(() => {
        const timeLocal = performance.now();
        setTime(performance.now());
        if (!("children" in transition)) { return; }
        const handles = [] as ReturnType<typeof setTimeout>[];
        let t = actionTime;
        for (const s of transition.children) {
            const factoredDuration = s.duration * animationDurationFactor;
            t += factoredDuration;
            if (timeLocal < t) {
                const h = setTimeout(
                    () => setTime(performance.now()),
                    t - timeLocal + 10);
                handles.push(h);
            }
        }
        return () => handles.map(clearTimeout);
    }, [transition]);

    return {
        ...transition,
        currentState: getCraftingState(
            transition, actionTime, time, animationDurationFactor),
        currentTime: time,
    };
}