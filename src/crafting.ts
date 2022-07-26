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
} | {
    action: "addTube",
} | {
    action: "trashTube",
} | {
    action: "pourFromSecondaryIntoMain",
} | {
    action: "pourFromMainIntoSecondary",
};

export type CraftingState = {
    tubes: SubstanceId[][],
    targets: SubstanceId[][],
}

export type AppliedCraftingAction = {
    stateInitial: CraftingState,
    action: CraftingAction,
    stateAfterAction: CraftingState,
    reactions: Record<number, Reaction>;
    stateAfterReactions: CraftingState;
    cleanups: Record<number, SubstanceId[]>;
    stateAfterCleanups: CraftingState;
    stateFinal: CraftingState;
}

export function craftingReduce(
    { reactions }: {
        reactions: Reaction[],
    },
    action: CraftingAction,
    stateInitial: CraftingState,
) {
    const stateAfterAction = update(stateInitial, ((): Spec<CraftingState> => {
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
                    0: { $splice: [[stateInitial.tubes[0].length - 1]] },
                    1: { $push: [stateInitial.tubes[0][stateInitial.tubes[0].length - 1]] },
                }
            };
            case "pourFromSecondaryIntoMain": return {
                tubes: {
                    0: { $push: [stateInitial.tubes[1][stateInitial.tubes[1].length - 1]] },
                    1: { $splice: [[stateInitial.tubes[1].length - 1]] },
                }
            };
        }
    })());

    const applicableReactions = stateAfterAction.tubes
        .map((tube, i) => [i, reactions.find(r =>
            r.reagents[1] === tube[tube.length - 1]
            && r.reagents[0] === tube[tube.length - 2])] as const)
        .filter((x): x is [number, Reaction] => x[1] !== undefined);

    const stateAfterReactions = update(stateAfterAction, {
        tubes: {
            ...(Object.fromEntries(applicableReactions.map(([i, r]) => ([i, {
                $splice: [[stateAfterAction.tubes[i].length - 2, 2, ...r.products]]
            }]))) as Record<number, Spec<CraftingState["tubes"][0]>>),
        }
    });

    const cleanups = stateAfterReactions.tubes
        .map((tube, i) => [i, tube.splice(3)] as const)
        .filter((x) => x[1].length > 0);

    const stateAfterCleanups = update(stateAfterReactions, {
        tubes: {
            ...(Object.fromEntries(cleanups.map(([i, r]) => ([i, {
                $splice: [[3]]
            }]))) as Record<number, Spec<CraftingState["tubes"][0]>>),
        }
    });

    const tubeToGiveAwayIndex = stateAfterCleanups.tubes.findIndex(tube =>
        stateAfterCleanups.targets[0].every((sid, i) => tube[i] === sid));

    const stateAfterGiveAway =
        tubeToGiveAwayIndex >= 0
            ? update(stateAfterCleanups, {
                tubes: stateAfterCleanups.tubes.length > 1
                    ? { $splice: [[tubeToGiveAwayIndex, 1]] }
                    : { 0: { $set: [] } },
                targets: { $splice: [[0, 1]] },
            })
            : stateAfterCleanups;

    return {
        stateInitial,
        action,
        stateAfterAction,
        reactions: applicableReactions,
        stateAfterReactions,
        cleanups,
        stateAfterCleanups,
        tubeToGiveAwayIndex,
        stateAfterGiveAway,
        stateFinal: stateAfterGiveAway,
    }
}
