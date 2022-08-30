import update, { Spec } from 'immutability-helper';

export type SubstanceId = number;
export type Reaction = {
    reagents:
    [SubstanceId, SubstanceId],
    products:
    [SubstanceId]
    | [SubstanceId, SubstanceId]
    | [SubstanceId, SubstanceId, SubstanceId],
}

export type CraftingAction = {
    action: "addIngredient",
    ingredientId: SubstanceId,
    time: number,
} | {
    action: "addTube",
    time: number,
} | {
    action: "trashTube",
    time: number,
} | {
    action: "pourFromSecondaryIntoMain",
    time: number,
} | {
    action: "pourFromMainIntoSecondary",
    time: number,
} | {
    action: "swapTubes",
    time: number,
};

export type CraftingState = {
    tubes: SubstanceId[][],
    targets: SubstanceId[][],
}

export function craftingAct(
    state: CraftingState,
    action: CraftingAction,
) {
    const diff = ((state: CraftingState): Spec<CraftingState> => {
        switch (action.action) {
            case "addIngredient": return {
                tubes: { 0: { $push: [action.ingredientId] } },
            };
            case "addTube": return {
                tubes: { $splice: [[0, 0, []]] },
            };
            case "trashTube": return {
                tubes: { $splice: [[0, 1]] },
            };
            case "pourFromMainIntoSecondary": return {
                tubes: {
                    0: { $splice: [[state.tubes[0].length - 1]] },
                    1: { $push: [state.tubes[0][state.tubes[0].length - 1]] },
                }
            };
            case "pourFromSecondaryIntoMain": return {
                tubes: {
                    0: { $push: [state.tubes[1][state.tubes[1].length - 1]] },
                    1: { $splice: [[state.tubes[1].length - 1]] },
                }
            };
            case "swapTubes": return {
                tubes:{
                     0: { $set: state.tubes[1] },
                     1: { $set: state.tubes[0] } 
                    }
            }
        }
    })(state);
    return {
        id: "craftingAct" as const,
        diffCustom: action,
        diff,
        prevState: state,
        state: update(state, diff),
        start: action.time,
        duration: 400,
    };
}
export function craftingReact(
    state: CraftingState,
    reactions: Reaction[],
) {
    const applicableReactions = state.tubes
        .map((tube, i) => [i, reactions.find(r =>
            r.reagents[1] === tube[tube.length - 1]
            && r.reagents[0] === tube[tube.length - 2])] as const)
        .filter((x): x is [number, Reaction] => x[1] !== undefined);

    const diff =  {
        tubes: {
            ...(Object.fromEntries(applicableReactions.map(([i, r]) => ([i, {
                $splice: [[state.tubes[i].length - 2, 2, ...r.products]]
            }]))) as Record<number, Spec<CraftingState["tubes"][0]>>),
        }
    };

    return {
        id: "craftingReact" as const,
        diffCustom: applicableReactions,
        diff,
        prevState: state,
        state: update(state, diff),
        // start: action.time,
        duration: applicableReactions.length > 0 ? 400 : 0,
    };
}

export function craftingCleanup(
    state: CraftingState,
) {
    const cleanups = state.tubes
        .map((tube, i) => [i, tube.slice(3)] as const)
        .filter((x) => x[1].length > 0);

    const diff = {
        tubes: {
            ...(Object.fromEntries(cleanups.map(([i, r]) => ([i, {
                $splice: [[3]]
            }]))) as Record<number, Spec<CraftingState["tubes"][0]>>),
        }
    };

    return {
        id: "craftingCleanup" as const,
        diffCustom: cleanups,
        diff,
        prevState: state,
        state: update(state, diff),
        // start: action.time,
        duration: cleanups.length > 0 ? 400 : 0,
    };
}

export function craftingGiveaway(
    state: CraftingState,
) {
    const tubeToGiveAwayIndex = state.tubes.findIndex(tube =>
        state.targets[0].every((sid, i) => tube[i] === sid));

    const diff: Spec<typeof state> =
        tubeToGiveAwayIndex >= 0
            ? {
                tubes: state.tubes.length > 1
                    ? { $splice: [[tubeToGiveAwayIndex, 1]] }
                    : { 0: { $set: [] } },
                targets: { $splice: [[0, 1]] },
            } : {};
    return {
        id: "craftingGiveaway" as const,
        diffCustom: tubeToGiveAwayIndex,
        diff,
        prevState: state,
        state: update(state, diff),
        // start: action.time,
        duration: tubeToGiveAwayIndex >= 0 ? 1200 : 0,
    };
}

export function craftingReduce(
    { reactions }: {
        reactions: Reaction[],
    },
    action: CraftingAction,
    state: CraftingState,
) {
    const afterAction = craftingAct(state, action);
    const afterReactions = craftingReact(afterAction.state, reactions);
    const afterCleanups = craftingCleanup(afterReactions.state);
    const afterGiveaway = craftingGiveaway(afterCleanups.state);

    return {
        prevState: state,
        action,
        afterAction,
        afterReactions,
        afterCleanups,
        afterGiveaway,
        state: afterGiveaway.state,
        children: [
            afterAction,
            afterReactions,
            afterCleanups,
            afterGiveaway,
        ].filter(x => x.duration > 0),
    }
}
