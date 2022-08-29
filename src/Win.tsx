import { selector, useRecoilValue } from 'recoil';
import { gameProgressState, levelPresetRecoil } from "./LevelList";
import { useEffect } from "preact/hooks";
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import * as amplitude from "@amplitude/analytics-browser";
import { craftingStateInTimeRecoil } from './craftingActionsRecoil';

export const isWinRecoil = selector({
    key: "isWin",
    get: ({ get }) => {
        const { state } = get(craftingStateInTimeRecoil);
        return state.targets.length === 0;
    }
});

export function WinEffect() {
    const craftingStateInTime = useRecoilValue(craftingStateInTimeRecoil);
    const isWin = craftingStateInTime.state.targets.length === 0;
    const level = useRecoilValue(levelPresetRecoil);
    const updGameProgress = useUpdRecoilState(gameProgressState);
    useEffect(() => {
        if (!isWin) { return; }
        amplitude.track("isWin", level);
        updGameProgress({
            [level.name]: { $set: true },
        });
    }, [isWin, level, updGameProgress]);
    return null;
};
