import { useRecoilValue } from 'recoil';
import * as flex from './utils/flex';
import { substanceColors } from './substanceColors';
import { KeyboardArrowUp } from '@emotion-icons/material-rounded/KeyboardArrowUp';
import { getProblemReactions } from './puzzle/reactions';
import { solutionRecoil, useCraftingTransition } from './solutionRecoil';
import { tutorialRecoil } from './tutorialRecoil';
import { css, cx, keyframes } from '@emotion/css';
import { Reaction } from './puzzle/reactions';
type CSSProperties = import("preact").JSX.CSSProperties;


export function ReactionsLibrary({ style }: { style?: CSSProperties }) {
    const problem = useRecoilValue(solutionRecoil).problem;
    const reactions = getProblemReactions(problem);

    const craftingStateInTime = useCraftingTransition();
    const { tubes } = craftingStateInTime.currentState.state;
    const mainTube = tubes[0];
    const currentSubstance = mainTube[mainTube.length - 1];
    const tutorial = useRecoilValue(tutorialRecoil);
    const now = craftingStateInTime.currentTime;

    function IngredientSlot({ sid }: { sid?: number }) {
        return <div className={cx(css`& {
            background-color: ${sid === undefined ? "#ffffff08" : substanceColors[sid]};
        }`)} style={{
                color: sid === undefined ? "#ffffff10" : "#ffffffff",
                borderRadius: "3px",
                margin: "1px",
                width: "18px",
                height: "18px",
                fontSize: "14px",
                lineHeight: "20px",
            }}>{sid ?? <>&nbsp;</>}</div>
    }

    function Reaction({ reaction }: { reaction: Reaction }) {
        const isApplicable = currentSubstance === reaction.reagents[0];
        const isPending = tubes.some((tube) =>
            reaction.reagents[1] === tube[tube.length - 1]
            && reaction.reagents[0] === tube[tube.length - 2]
        );
        const isHinted = tutorial.some(t =>
            t.kind === 'reaction'
            && t.reaction.every((sid, i) => sid === reaction.reagents[i]));

        return <div style={{
            position: "relative",
        }}>
            <div style={{
                ...flex.colS,
                textAlign: "center",
            }}>
                <IngredientSlot sid={reaction.products[2]} />
                <IngredientSlot sid={reaction.products[1]} />
                <IngredientSlot sid={reaction.products[0]} />
                <KeyboardArrowUp className={css`& {
                    color: ${isPending ? "yellow" : isApplicable ? "white" : "#ffffff30"};
                    font-size: 19px;
                    height: 18px;
                }`} />
                <IngredientSlot sid={reaction.reagents[1]} />
                <IngredientSlot sid={reaction.reagents[0]} />
            </div>
            {isApplicable && <div style={{
                position: "absolute",
                inset: "1px",
                border: "2px solid white",
                borderRadius: "3px",
            }}></div>}
            {isPending && <div style={{
                inset: "1px",
                position: "absolute",
                border: "2px solid yellow",
                borderRadius: "3px",
            }}> </div>}
            {isHinted && <div className={css`& {
                position: absolute;
                inset: 1px;
                border: 2px solid #ffffffa0;
                border-radius: 3px;
                animation: ${keyframes`
                    0% { transform: scale(1, 1); }
                    10% { transform: scale(0.8, 1.2); }
                    30% { transform: scale(1, 1); }
                    100% { transform: scale(1, 1); }
                `} 1300ms ${-now}ms infinite both linear;
            }`}> </div>}
        </div>;
    }

    return <div
        style={{
            ...flex.rowS,
            justifyContent: "center",
            padding: "0px 3px",
            zIndex: 1,
            ...style,
        }}
    ><div
        className={cx(css`
            &::-webkit-scrollbar { height: 7px; }
            &::-webkit-scrollbar-track { background: #0005; }
            &::-webkit-scrollbar-thumb { background: #666; }
            &::-webkit-scrollbar-thumb:hover { background: #999; }
            &::-webkit-scrollbar-button:single-button { background: transparent; width: 7px; }
            &::-webkit-scrollbar-button:single-button:hover { background: #777; }
        `)}
        style={{
            ...flex.rowS,
            padding: "24px 0px 10px",
            overflowX: "scroll",
            userSelect: "none",
        }}
    >
            {reactions.map(r => <Reaction reaction={r} />)}
        </div></div>;
}
