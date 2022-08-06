import { GetRecoilValue, selector } from "recoil";
import { craftingStateInTimeRecoil } from "./craftingActionsRecoil";
import { levelPresetRecoil } from "./LevelList";
import { levelPresets } from "./levelPresets";

const tutorialMap = {
    [levelPresets[0].name]: function* (get: GetRecoilValue) {
        const craftingStateInTime = get(craftingStateInTimeRecoil);
        const { tubes, targets } = craftingStateInTime.state;

        if (targets.length === 0) {
            yield { kind: "next" as const };
            return;
        }

        const tube = tubes[0];
        const target = targets[0];

        if (tube.some((_, i) => tube[i] !== target[i])) {
            yield { kind: "reset" as const };
            return;
        }

        yield* [{
            kind: "addIngredient" as const,
            ingredientId: target[tube.length]
        }, {
            kind: "target" as const,
            slotIndex: tube.length,
        }];
    },
    [levelPresets[1].name]: function* (get: GetRecoilValue) {
        const craftingStateInTime = get(craftingStateInTimeRecoil);
        const { tubes, targets } = craftingStateInTime.state;

        if (targets.length === 0) {
            yield { kind: "next" as const };
            return;
        }

        const tube = tubes[0];
        const target = targets[0];
        if (tube.length === 0) {
            yield* [{
                kind: "addIngredient" as const,
                ingredientId: 0
            }, {
                kind: "reaction" as const,
                reaction: [0, 1],
            }, {
                kind: "target" as const,
                slotIndex: 0,
            }, {
                kind: "target" as const,
                slotIndex: 1,
            }];
            return;
        }

        if (tube.length === 1) {
            if (tube[0] !== 0) {
                yield { kind: "reset" as const };
                return;
            }

            yield* [{
                kind: "addIngredient" as const,
                ingredientId: 1
            }, {
                kind: "reaction" as const,
                reaction: [0, 1],
            }, {
                kind: "target" as const,
                slotIndex: 0,
            }, {
                kind: "target" as const,
                slotIndex: 1,
            }];
            return;
        }

        if (tube.some((_, i) => tube[i] !== target[i])) {
            yield { kind: "reset" as const };
            return;
        }

        yield* [{
            kind: "addIngredient" as const,
            ingredientId: target[tube.length]
        }, {
            kind: "target" as const,
            slotIndex: tube.length,
        }];
    },
    [levelPresets[3].name]: function* (get: GetRecoilValue) {
        const craftingStateInTime = get(craftingStateInTimeRecoil);
        const { tubes, targets } = craftingStateInTime.state;

        if (targets.length === 0) {
            yield { kind: "next" as const };
            return;
        }

        const tube = tubes[0];
        const target = targets[0];

        if (tube.length > 0 && tubes.length === 1) {
            yield { kind: "reset" as const };
            return;
        }

        if (tubes.length === 1) {
            yield { kind: "addTube" as const };
            return;
        }

        if (tube.length === 0) {
            yield* [{
                kind: "addIngredient" as const,
                ingredientId: 0
            }, {
                kind: "reaction" as const,
                reaction: [0, 1],
            }, {
                kind: "target" as const,
                slotIndex: 0,
            }];
            return;
        }

        if (tube[0] === 0) {
            if (tube.length === 1) {
                yield* [{
                    kind: "addIngredient" as const,
                    ingredientId: 1
                }, {
                    kind: "reaction" as const,
                    reaction: [0, 1],
                }, {
                    kind: "target" as const,
                    slotIndex: 0,
                }];
                return;
            }

            yield { kind: "reset" as const };
            return;
        }

        if (tube[0] === 3) {
            if (tube.length === 2 && tube[1] === 2) {
                yield { kind: "pourFromMainIntoSecondary" as const };
                return;
            }
        }

        if (tube.some((_, i) => tube[i] !== target[i])) {
            yield { kind: "reset" as const };
            return;
        }

        yield* [{
            kind: "addIngredient" as const,
            ingredientId: target[tube.length]
        }, {
            kind: "target" as const,
            slotIndex: tube.length,
        }];
    },
}

export const tutorialRecoil = selector({
    key: "tutrial",
    get: ({ get }) => {
        const levelPreset = get(levelPresetRecoil);
        const tutrialGenerator = tutorialMap[levelPreset.name];
        return tutrialGenerator
            ? [...tutrialGenerator(get)]
            : [];
    }
})