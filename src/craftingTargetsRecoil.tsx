import { selector } from "recoil";
import { generateCraftingTargets } from "./generateCraftingTargets";
import { levelPresetRecoil } from "./LevelList";
import { reactionsLibraryRecoil } from "./ReactionsLibrary";

export const craftingTargetsRecoil = selector({
    key: "craftingTargets",
    get: ({ get }) => {
        const { seed, targets, substanceCount } = get(levelPresetRecoil);
        const reactions = get(reactionsLibraryRecoil);
        return generateCraftingTargets({ reactions, seed, substanceCount, targets });
    }
});
