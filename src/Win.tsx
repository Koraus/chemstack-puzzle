import { useRecoilValue } from 'recoil';
import { gameProgressState } from "./LevelList";
import { useEffect } from "preact/hooks";
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import * as amplitude from "@amplitude/analytics-browser";
import { solutionRecoil, useCraftingState } from './craftingActionsRecoil';
import { isSolved } from './puzzle/actions';

export function WinEffect() {
    const finalState = useCraftingState().state;
    const isWin = isSolved(finalState);
    
    const problem = useRecoilValue(solutionRecoil).problem;
    const updGameProgress = useUpdRecoilState(gameProgressState);
    useEffect(() => {
        if (!isWin) { return; }
        amplitude.track("isWin", problem);
        updGameProgress({
            [problem.name]: { $set: true },
        });
    }, [isWin, problem, updGameProgress]);
    return null;
};
