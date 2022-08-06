import { selector, useRecoilValue } from 'recoil';
import * as flex from './utils/flex';
import { levelPresetRecoil } from './LevelList';
import { substanceColors } from './substanceColors';
import { Reaction } from './crafting';
import { KeyboardArrowUp } from '@emotion-icons/material-rounded/KeyboardArrowUp';
import { generateReactionsLibrary } from './generateReactionsLibrary';
import { getCraftingState, craftingStateInTimeRecoil } from './craftingActionsRecoil';
import { tutorialRecoil } from './tutorialRecoil';
import { css, keyframes } from '@emotion/css';
type CSSProperties = import("preact").JSX.CSSProperties;

export const reactionsLibraryRecoil = selector({
    key: "reactionsLibrary",
    get: ({ get }) => {
        const levelPreset = get(levelPresetRecoil);
        return generateReactionsLibrary(levelPreset)
            .sort((r1, r2) => r1.reagents[0] - r2.reagents[0])
            .filter(r => [...r.reagents, ...r.products]
                .every(sid => sid < levelPreset.substanceCount));
    }
})

export function ReactionsLibrary({ style }: { style?: CSSProperties }) {
    const { tubes } = 
        getCraftingState(useRecoilValue(craftingStateInTimeRecoil)).state;
    const mainTube = tubes[0];
    const currentSubstance = mainTube[mainTube.length - 1];
    const reactions = useRecoilValue(reactionsLibraryRecoil);
    const tutorial = useRecoilValue(tutorialRecoil);

    function IngredientSlot({ sid }: { sid?: number }) {
        return <div style={{
            backgroundColor: sid === undefined ? "#ffffff08" : substanceColors[sid],
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
                ...flex.col,
                textAlign: "center",
            }}>
                <IngredientSlot sid={reaction.products[2]} />
                <IngredientSlot sid={reaction.products[1]} />
                <IngredientSlot sid={reaction.products[0]} />
                <KeyboardArrowUp
                    style={{
                        color:
                            isPending
                                ? "yellow"
                                : isApplicable ? "white" : "#ffffff30",
                        fontSize: "19px",
                        height: "18px",
                    }}
                />
                <IngredientSlot sid={reaction.reagents[1]} />
                <IngredientSlot sid={reaction.reagents[0]} />
            </div>
            {isApplicable && <div style={{
                zIndex: 1,
                position: "absolute",
                top: "1px",
                left: "1px",
                bottom: "1px",
                right: "1px",
                border: "2px solid white",
                borderRadius: "3px",
            }}></div>}
            {isPending && <div
                style={{
                    zIndex: 1,
                    position: "absolute",
                    top: "1px",
                    left: "1px",
                    bottom: "1px",
                    right: "1px",
                    border: "2px solid yellow",
                    borderRadius: "3px",
                }}> </div>}
            {isHinted && <div
                className={css`& {
                    z-index: 1;
                    position: absolute;
                    top: 1px;
                    left: 1px;
                    bottom: 1px;
                    right: 1px;
                    border: 2px solid #ffffffa0;
                    border-radius: 3px;
                    animation-name: ${keyframes`
                        0% {
                            transform: scale(1, 1);
                        }
                        10% {
                            transform: scale(0.8, 1.2);
                        }
                        30% {
                            transform: scale(1, 1);
                        }
                        100% {
                            transform: scale(1, 1);
                        }
                    `};
                    animation-duration: 1300ms;
                    animation-fill-mode: both;
                    animation-iteration-count: infinite;
                    animation-timing-function: linear;
                }`}> </div>}
        </div>;
    }

    return <div style={{
        ...flex.row,
        justifyContent: "center",
        padding: "0px 3px",
        ...style,
    }}><div style={{
        ...flex.row,
        padding: "24px 0px 20px",
        overflowX: "scroll",
        userSelect: "none",
    }}>
            {reactions.map(r => <Reaction reaction={r} />)}
        </div></div>;
}
