import { useRecoilValue } from 'recoil';
import { css, cx } from "@emotion/css";
import { buttonCss } from "./buttonCss";
import { JSX } from "preact";
import { solutionRecoil, useCraftingTransition, useSetNextProblem } from './solutionRecoil';
import { ArrowRight } from "@emotion-icons/material-rounded/ArrowRight";
import { isSolved } from './puzzle/actions';



export function HeaderTitle({
    isHorizontal, className, ...props
}: {
    isHorizontal?: boolean;
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const setNextLevel = useSetNextProblem();
    const finalState = useCraftingTransition().state;
    const isWin = isSolved(finalState);
    
    return <div {...props} className={cx(css`& {
        display: flex;
        flex: row;
    }`, className)}>
        {isHorizontal ?? <div className={css`& { flex-grow: 1; }`}>
            <button
                className={cx(
                    buttonCss,
                    css`& {
                        margin: 0 5px;
                        padding: 0px;
                        width: 30px;
                        visibility: hidden;
                    }`
                )}
                onClick={setNextLevel}
            ><ArrowRight className={css`$ { height: 100%; }`} /></button>
        </div>}
        <div className={css`& {
            color: #f7f7f7;
            font-size: 25px;
            text-transform: uppercase;
            text-align: ${isHorizontal ? "left" : "center"};
        }`}>{useRecoilValue(solutionRecoil).problem.name}</div>
        <div className={css`& { flex-grow: 1; }`}>
            <button
                className={cx(
                    buttonCss,
                    css`& {
                        margin: 0 5px;
                        padding: 0px;
                        width: 30px;
                        visibility: hidden;
                    }`,
                    isWin && css`& {
                        visibility: visible;
                    }`
                )}
                onClick={setNextLevel}
            ><ArrowRight className={css`$ { height: 100%; }`} /></button>
        </div>
    </div>;
}
