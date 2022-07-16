import { cx } from "@emotion/css";
import { selector, useRecoilValue } from "recoil";
import { appliedCraftingActionsRecoil } from "./CraftingTable";
import { levelPresetRecoil } from "./LevelEditor";
import { reactionsLibraryRecoil } from "./ReactionsLibrary";
import { Tube } from "./Tube";
import { createRand } from "./utils/createRand";
import * as flex from "./utils/flex";
type CSSProperties = import("preact").JSX.CSSProperties;

export const craftingTargetsRecoil = selector({
    key: "craftingTargets",
    get: ({ get }) => {
        const { seed, targets, substanceCount } = get(levelPresetRecoil);
        const reactions = get(reactionsLibraryRecoil);

        return targets.map(targetSeed => {
            const checkReactivity = true;

            const rand = createRand(seed + "craftingTargets" + targetSeed);
            for (let tryCount = 0; tryCount < 100; tryCount++) {
                const target = [
                    rand.rangeInt(substanceCount),
                    rand.rangeInt(substanceCount),
                    rand.rangeInt(substanceCount),
                ];
                if (!checkReactivity) {
                    return target;
                }
                const applicableReactions1 = reactions.some(ra => ra.reagents[1] === target[1]
                    && ra.reagents[0] === target[0]);
                if (applicableReactions1) { continue; }

                const applicableReactions2 = reactions.some(ra => ra.reagents[1] === target[2]
                    && ra.reagents[0] === target[1]);
                if (applicableReactions2) { continue; }

                return target;
            }
            throw "craftingTargets tryCount limit exceeded";
        });
    }
})

export function CraftingTargets({ style, className }: {
    style?: CSSProperties,
    className?: string,
}) {
    const { stateFinal } = useRecoilValue(appliedCraftingActionsRecoil);
    const { targets } = stateFinal;
    return <div
        className={cx(className)}
        style={{
            ...flex.row,
            ...style,
        }}
    >
        <div style={{ ...flex.row }}>
            {targets.map(target => <Tube tube={target} isTarget={true} />)}
        </div>
    </div>;
}