import { atom, useSetRecoilState, DefaultValue } from "recoil";
import { Action, actions, isSolved } from "./puzzle/actions";
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { useRecoilValue, AtomEffect } from "recoil";
import { useEffect, useState } from "preact/hooks";
import { problems } from "./puzzle/problems";
import { evaluate } from "./puzzle/evaluate";
import { getSolutionCmp, getSolutionCmpObj, Solution } from "./puzzle/solution";
import * as amplitude from "@amplitude/analytics-browser";
import * as _ from "lodash";
import update, { Spec } from "immutability-helper";
import { getProblemCmp } from "./puzzle/problem";
import { postSolution } from "./statsClient";
import { _throw } from "./puzzle/_throw";

const localStorageAtomEffect = <T, U>({ key, select, unselect }: {
    key?: string | ((key: string) => string),
    select: (x: T) => U,
    unselect: (x: U) => T,
}) => ({ node, setSelf, onSet }: Parameters<AtomEffect<T>>[0]) => {
    const keyStr =
        key === undefined ? node.key
            : (typeof key === "string"
                ? key
                : key(node.key));
    const savedValue = localStorage.getItem(keyStr)
    if (savedValue != null) {
        setSelf(unselect(JSON.parse(savedValue)));
    }

    onSet((newValue, _, isReset) => {
        if (isReset) {
            localStorage.removeItem(keyStr);
        } else {
            console.log("localStorage.setItem", keyStr, select(newValue));
            localStorage.setItem(keyStr, JSON.stringify(select(newValue)));
        }
    });
};

const solutionRecoilDefault = {
    problem: problems[0],
    actions: [] as Solution['actions'],
    actionTime: 0,
    currentTime: 0,
    knownSolutions: {} as Record<string, Solution>,
    confirmedSolutions: {} as Record<string, Awaited<ReturnType<typeof postSolution>>>,
};

export const solutionRecoil = atom({
    key: "solution",
    default: solutionRecoilDefault,
    effects: [
        localStorageAtomEffect({
            select: (x) => _.pick(x, "knownSolutions", "confirmedSolutions"),
            unselect: (x) => ({
                ...solutionRecoilDefault,
                ...x,
            }),
        }),
        ({ onSet }) => { // analytics effect
            onSet(async (newValue, oldValue) => {
                const oldProblem = ("problem" in oldValue) && oldValue.problem;
                const newProblem = newValue.problem;
                if (newProblem !== oldProblem) {
                    // legacy log
                    amplitude.track(`levelPreset.onSet`, newValue.problem);

                    amplitude.track(`problem changed`, newValue.problem);
                }
            });
        },
        ({ node, onSet, setSelf }) => { // stats submission effect
            type T = typeof node.__tag[0];
            const updSelf = (spec: Spec<T>) => setSelf(s => update(s, spec));

            onSet(async (newValue, oldValue) => {
                const oldKnownSolutions =
                    ("knownSolutions" in oldValue) && oldValue.knownSolutions;
                if (!oldKnownSolutions) { return; }
                const newKnownSolutions =
                    newValue.knownSolutions;

                const addedSolutions = Object.keys(newKnownSolutions)
                    .filter(solutionId => !(solutionId in oldKnownSolutions))
                    .map(solutionId => newKnownSolutions[solutionId]);

                console.log("addedSolutions", addedSolutions);
                for (const solution of addedSolutions) {
                    (async () => {
                        const result = await postSolution(solution);
                        updSelf({
                            confirmedSolutions: {
                                [getSolutionCmp(solution)]: { $set: result },
                            }
                        });
                    })(); // just run, do not await
                }
            });
        },
        ({ node, onSet, setSelf }) => {
            type T = typeof node.__tag[0];
            const updSelf = (spec: Spec<T>) => setSelf(s => update(s, spec));

            const handles = [] as ReturnType<typeof setTimeout>[];

            onSet(async (newValue) => {
                handles.map(clearTimeout);

                const setTime = (t: number) => updSelf({ currentTime: { $set: t } });

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
    const set = useSetRecoilState(solutionRecoil);
    return (action: Action) => set(prevState => {
        let nextState = update(prevState, {
            actions: { $push: [action] },
            actionTime: { $set: performance.now() },
        });
        if (isSolved(evaluate(nextState).state)) {
            const solutionId = getSolutionCmp(nextState);
            nextState = update(nextState, {
                knownSolutions: {
                    [solutionId]: { $set: getSolutionCmpObj(nextState) }
                }
            });
        }
        return nextState;
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

export function useCraftingTransition() {
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