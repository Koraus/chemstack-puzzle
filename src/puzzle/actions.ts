import update, { Spec } from 'immutability-helper';
import { getProblemReactions, Reaction } from './reactions';
import { State, SubstanceId } from './state';
import { _throw } from './_throw';


export const isSolved = (state: State) => state.targets.length === 0;

export const actions = ({
    addIngredient: (ingredientId: SubstanceId) => ({
        canAct: (state: State): boolean =>
            !isSolved(state),
        act: (state: State): Spec<State> => {
            return ({
                tubes: { 0: { $push: [ingredientId] } },
                stats: {
                    actionCount: { $set: state.stats.actionCount + 1 },
                    price: { $set: state.stats.price + ingredientId },
                }
            });
        },
    }),

    addTube: () => ({
        canAct: (state: State): boolean =>
            !isSolved(state) 
            && state.tubes.length <= 6,
        act: (state: State): Spec<State> => {
            return ({
                tubes: { $splice: [[0, 0, []]] },
                stats: {
                    actionCount: { $set: state.stats.actionCount + 1 },
                    maxAddedTubeCount: { $set: Math.max(
                        state.stats.maxAddedTubeCount,
                        (state.tubes.length - 1) + 1,
                    ) },
                }
            });
        },
    }),

    trashTube: () => ({
        canAct: (state: State): boolean =>
            !isSolved(state) 
            && state.tubes.length > 1,
        act:
            (state: State): Spec<State> => {
                return ({
                    tubes: { $splice: [[0, 1]] },
                    stats: {
                        actionCount: { $set: state.stats.actionCount + 1 },
                        price: { $set: 
                            state.stats.price 
                            + state.tubes[0].reduce((acc, val) => acc + val, 0) 
                        }
                    }
                });
            },
    }),

    pourFromMainIntoSecondary: () => ({
        canAct: (state: State): boolean =>
            !isSolved(state) 
            && state.tubes.length > 1
            && state.tubes[0].length > 0,
        act:
            (state: State): Spec<State> => {
                return ({
                    tubes: {
                        0: { $splice: [[state.tubes[0].length - 1]] },
                        1: { $push: [state.tubes[0][state.tubes[0].length - 1]] },
                    },
                    stats: {
                        actionCount: { $set: state.stats.actionCount + 1 },
                    }
                });
            },
    }),

    pourFromSecondaryIntoMain: () => ({
        canAct: (state: State): boolean =>
            !isSolved(state)
            && state.tubes.length > 1
            && state.tubes[1].length > 0,
        act:
            (state: State): Spec<State> => {
                return ({
                    tubes: {
                        0: { $push: [state.tubes[1][state.tubes[1].length - 1]] },
                        1: { $splice: [[state.tubes[1].length - 1]] },
                    },
                    stats: {
                        actionCount: { $set: state.stats.actionCount + 1 },
                    }
                });
            },
    }),

    swapTubes: () => ({
        canAct: (state: State): boolean =>
            !isSolved(state)
            && state.tubes.length > 1,
        act:
            (state: State): Spec<State> => {
                return ({
                    tubes: {
                        0: { $set: state.tubes[1] },
                        1: { $set: state.tubes[0] }
                    },
                    stats: {
                        actionCount: { $set: state.stats.actionCount + 1 },
                    }
                });
            },
    }),
});


export type Action<ActionKey extends keyof typeof actions = keyof typeof actions> = {
    action: ActionKey,
    args: Parameters<typeof actions[ActionKey]>,
}

function act<T extends keyof typeof actions>(
    state: State,
    action: {
        action: T,
        args: Parameters<typeof actions[T]>,
    },
) {
    const act1 = actions[action.action];
    const args = action.args;
    // @ts-ignore
    const act2 = act1(...args);
    act2.canAct(state) || _throw("Cannot act");
    const diff = act2.act(state);
    return {
        id: "act" as const,
        diffCustom: action,
        diff,
        prevState: state,
        state: update(state, diff),
        duration: 400,
    };
}

function react(state: State) {
    const reactions = getProblemReactions(state.problem);

    const applicableReactions = state.tubes
        .map((tube, i) => [i, reactions.find(r =>
            r.reagents[1] === tube[tube.length - 1]
            && r.reagents[0] === tube[tube.length - 2])] as const)
        .filter((x): x is [number, Reaction] => x[1] !== undefined);

    const diff = {
        tubes: {
            ...(Object.fromEntries(applicableReactions.map(([i, r]) => ([i, {
                $splice: [[state.tubes[i].length - 2, 2, ...r.products]]
            }]))) as Record<number, Spec<State["tubes"][0]>>),
        }
    };

    return {
        id: "react" as const,
        diffCustom: applicableReactions,
        diff,
        prevState: state,
        state: update(state, diff),
        duration: applicableReactions.length > 0 ? 400 : 0,
    };
}

function cleanup(state: State) {
    const cleanups = state.tubes
        .map((tube, i) => [i, tube.slice(3)] as const)
        .filter((x) => x[1].length > 0);

    const cleanupPrice = cleanups
        .flatMap(([, cu]) => cu)
        .reduce((acc, val) => acc + val, 0);

    const diff = {
        tubes: {
            ...(Object.fromEntries(cleanups.map(([i, r]) => ([i, {
                $splice: [[3]]
            }]))) as Record<number, Spec<State["tubes"][0]>>),
        },
        stats: {
            price: { $set: state.stats.price + cleanupPrice },
        },
    };

    return {
        id: "cleanup" as const,
        diffCustom: cleanups,
        diff,
        prevState: state,
        state: update(state, diff),
        duration: cleanups.length > 0 ? 400 : 0,
    };
}

function giveaway(state: State) {
    const tubeToGiveAwayIndex = state.tubes.findIndex(tube =>
        state.targets[0].every((sid, i) => tube[i] === sid));

    const diff: Spec<typeof state> =
        tubeToGiveAwayIndex >= 0
            ? {
                tubes: state.tubes.length > 1
                    ? { $splice: [[tubeToGiveAwayIndex, 1]] }
                    : { 0: { $set: [] } },
                targets: { $splice: [[0, 1]] },
                isSolved: { $set: state.targets.length === 1 },
            } : {};

    return {
        id: "giveaway" as const,
        diffCustom: tubeToGiveAwayIndex,
        diff,
        prevState: state,
        state: update(state, diff),
        duration: tubeToGiveAwayIndex >= 0 ? 1200 : 0,
    };
}

export function actRound<T extends keyof typeof actions>(
    action: Action<T>,
    state: State,
) {
    console.log("call", "actRound");
    const afterAction = act(state, action);
    const afterReactions = react(afterAction.state);
    const afterCleanups = cleanup(afterReactions.state);
    const afterGiveaway = giveaway(afterCleanups.state);

    return {
        prevState: state,
        state: afterGiveaway.state,
        action,
        children: [
            afterAction,
            afterReactions,
            afterCleanups,
            afterGiveaway,
        ].filter(x => x.duration > 0),
    }
}
