import { selector } from "recoil";
import { solutionRecoil } from "./solutionRecoil";
import { problems } from "./puzzle/problems";
import { evaluate } from "./puzzle/evaluate";
import memoize from 'memoizee';
import { State as CraftingState, SubstanceId } from "./puzzle/state";

const delay = {
    short: 3500,
    medium: 6000,
    long: 9000,
};
const hint = {
    next: (delay?: number) =>
        ({ kind: "next" as const, delay }),
    reset: (delay?: number) =>
        ({ kind: "reset" as const, delay }),
    addIngredient: (ingredientId: SubstanceId, delay?: number) =>
        ({ kind: "addIngredient" as const, ingredientId, delay }),
    target: (slotIndex: number, delay?: number) =>
        ({ kind: "target" as const, slotIndex, delay }),
    reaction: (reaction: [number, number], delay?: number) =>
        ({ kind: "reaction" as const, reaction, delay }),
    addTube: (delay?: number) =>
        ({ kind: "addTube" as const, delay }),
    pourFromMainIntoSecondary: (delay?: number) =>
        ({ kind: "pourFromMainIntoSecondary" as const, delay }),
};

const tutorialMap = {
    [problems[0].name]: function* ({ tubes: [tube], targets: [target] }: CraftingState) {
        if (!target) {
            yield hint.next();
            return;
        }

        if (tube.some((_, i) => tube[i] !== target[i])) {
            yield hint.reset();
            return;
        }

        yield hint.addIngredient(target[tube.length]);
        yield hint.target(tube.length);
    },
    [problems[1].name]: function* ({ tubes: [tube], targets: [target] }: CraftingState) {
        if (!target) {
            yield hint.next(delay.long);
            return;
        }

        if (tube.length === 0) {
            yield hint.addIngredient(0);
            yield hint.reaction([0, 1]);
            yield hint.target(0);
            yield hint.target(1);
            return;
        }

        if (tube.length === 1) {
            if (tube[0] !== 0) {
                yield hint.reset();
                return;
            }

            yield hint.addIngredient(1);
            yield hint.reaction([0, 1]);
            yield hint.target(0);
            yield hint.target(1);
            return;
        }

        if (tube.some((_, i) => tube[i] !== target[i])) {
            yield hint.reset();
            return;
        }

        yield hint.addIngredient(target[tube.length], delay.short);
        yield hint.target(tube.length);
    },
    [problems[2].name]: function* ({ tubes, targets }: CraftingState) {
        if (targets.length === 0) {
            yield hint.next(delay.long);
            return;
        }

        if (targets.length === 1) {
            const tube = tubes[0];
            const target = targets[0];

            if (tube.some((_, i) => tube[i] !== target[i])) {
                yield hint.addTube();
                return;
            }

            yield hint.addIngredient(target[tube.length], delay.medium);
            yield hint.target(tube.length);
            return;
        }

        if (targets.length === 2) {
            const tube = tubes[0];
            const target = targets[0];

            if (tube.length === 0) {
                yield hint.addIngredient(0, delay.short);
                yield hint.reaction([0, 1]);
                yield hint.target(0);
                yield hint.target(1);
                return;
            }
    
            if (tube.length === 1) {
                if (tube[0] !== 0) {
                    yield hint.reset();
                    return;
                }
    
                yield hint.addIngredient(1, delay.short);
                yield hint.reaction([0, 1]);
                yield hint.target(0);
                yield hint.target(1);
                return;
            }
    
            if (tube.some((_, i) => tube[i] !== target[i])) {
                yield hint.reset();
                return;
            }

            yield hint.addIngredient(target[tube.length], delay.medium);
            yield hint.target(tube.length);
            return;
        }
    },
    [problems[3].name]: function* ({ tubes, targets }: CraftingState) {
        const tube = tubes[0];
        const target = targets[0];

        if (!target) {
            yield hint.next(delay.long);
            return;
        }

        if (tube.length === 0) {
            yield hint.addIngredient(0);
            yield hint.reaction([0, 1]);
            yield hint.target(0);
            return;
        }

        if (tube[0] === 0) {
            if (tube.length === 1) {
                yield hint.addIngredient(1);
                yield hint.reaction([0, 1]);
                yield hint.target(0);
                return;
            }

            yield hint.reset();
            return;
        }

        if (tube[0] === 3) {
            if (tube.length === 2 && tube[1] === 2) {
                yield hint.pourFromMainIntoSecondary();
                return;
            }
        }

        if (tube.some((_, i) => tube[i] !== target[i])) {
            yield hint.reset();
            return;
        }

        yield hint.addIngredient(target[tube.length], delay.medium);
        yield hint.target(tube.length);
    },
    [problems[4].name]: function* ({ tubes, targets }: CraftingState) {
        const tube = tubes[0];
        const target = targets[0];

        if (!target) {
            yield hint.next(delay.long);
            return;
        }

        if (tube.length === 0) {
            yield hint.addIngredient(target[0], delay.medium);
            yield hint.target(0);
            return;
        }

        if (tube[0] !== 0) {
            yield hint.reset();
            return;
        }

        if (tube.length === 1) {
            yield hint.addIngredient(0, delay.short);
            yield hint.reaction([0, 1]);
            yield hint.target(0);
            return;
        }
        
        if (tube[1] === 0) {
            if (tube.length !== 2) {
                yield hint.reset();
                return;
            }

            yield hint.addIngredient(1, delay.short);
            yield hint.reaction([0, 1]);
            yield hint.target(0);
            return;
        }

        if (tube[1] !== 3) {
            yield hint.reset();
            return;
        }

        if (tube.length === 3 && tube[2] === 2) {
            yield hint.pourFromMainIntoSecondary();
            return;
        }

        yield hint.addIngredient(target[tube.length], delay.medium);
        yield hint.target(tube.length);
    },
}

const _generateTutorial = memoize((problemName: string, state: CraftingState) => {
    const tutrialGenerator = tutorialMap[problemName];
    return tutrialGenerator
        ? [...tutrialGenerator(state)]
        : [];
}, { max: 3 });

export const tutorialRecoil = selector({
    key: "tutorial",
    get: ({ get }) => _generateTutorial(
        get(solutionRecoil).problem.name,
        evaluate(get(solutionRecoil)).state,
    )
});
