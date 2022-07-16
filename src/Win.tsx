import { selector, useRecoilValue } from 'recoil';
import { gameProgressState, levelPresetRecoil } from "./LevelEditor";
import { useEffect } from "preact/hooks";
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { appliedCraftingActionsRecoil, tubesState } from './CraftingTable';
import { craftingTargetsRecoil } from './CraftingTargets';

export const isWinRecoil = selector({
    key: "isWin",
    get: ({ get }) => {
        const { stateFinal } = get(appliedCraftingActionsRecoil);
        return stateFinal.targets.length === 0;
    }
});

export function WinEffect() {
    const isWin = useRecoilValue(isWinRecoil);
    const level = useRecoilValue(levelPresetRecoil);
    const updGameProgress = useUpdRecoilState(gameProgressState);
    useEffect(() => {
        if (!isWin) { return; }
        updGameProgress({
            [level.name]: { $set: true },
        });
    }, [isWin, level, updGameProgress]);
    return null;
};
