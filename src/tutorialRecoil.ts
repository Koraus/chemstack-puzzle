import { GetRecoilValue, selector } from "recoil";
import { craftingStateInTimeRecoil } from "./craftingActionsRecoil";
import { levelPresetRecoil } from "./LevelList";
import { levelPresets } from "./levelPresets";

const tutorialMap = {
    [levelPresets[0].name]: function *(get: GetRecoilValue) {
        const craftingStateInTime = get(craftingStateInTimeRecoil);
        const { tubes, targets } = craftingStateInTime.state;

        if (targets.length === 0) {
            yield { kind: "next" as const };
            return;
        }
        if (tubes[0].some((_, i) => tubes[0][i] !== targets[0][i])) {
            yield { kind: "reset" as const };
            return;
        }
        yield { 
            kind: "addIngredient" as const, 
            ingredientId: targets[0][tubes[0].length]
        };
    }
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