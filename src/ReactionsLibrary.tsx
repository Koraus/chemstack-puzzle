import { selector, useRecoilValue } from 'recoil';
import { tubesState } from "./CraftingTable";
import * as flex from './utils/flex';
import { levelPresetRecoil } from './LevelList';
import { substanceColors } from './substanceColors';
import { Reaction, SubstanceId } from './crafting';
import { createRand } from './utils/createRand';
import { apipe } from './utils/apipe';
import * as it from "./utils/it";
type CSSProperties = import("preact").JSX.CSSProperties;

export function generateReactionsLibrary({ seed, substanceMaxCount }: {
    seed: string;
    substanceMaxCount: number;
}) {
    const f1p = <T,>(all: T[], sub: T[]) =>
        all
            .filter(x => sub.indexOf(x) < 0)
            .map(r => [...sub, r]);

    function* f3(xs: number[]) {
        const n = xs.length;
        for (let x0 = 0; x0 < n; x0++) {
            for (let x1 = x0 + 1; x1 < n; x1++) {
                for (let x2 = x1 + 1; x2 < n; x2++) {
                    yield [xs[x0], xs[x1], xs[x2]];
                }
            }
        }
    }

    function* f5(xs: number[]) {
        const n = xs.length;
        for (let x0 = 0; x0 < n; x0++) {
            for (let x1 = x0 + 1; x1 < n; x1++) {
                for (let x2 = x1 + 1; x2 < n; x2++) {
                    for (let x3 = x2 + 1; x3 < n; x3++) {
                        for (let x4 = x3 + 1; x4 < n; x4++) {
                            yield [xs[x0], xs[x1], xs[x2], xs[x3], xs[x4]];
                        }
                    }
                }
            }
        }
    }

    function remapSids(reactions: Reaction[], sidRevMap: SubstanceId[]) {
        const sidMap = sidRevMap.map(() => 0);
        for (let i = 0; i < sidMap.length; i++) {
            sidMap[sidRevMap[i]] = i;
        }

        return reactions.map(r => ({
            reagents: r.reagents.map(sid => sidMap[sid]),
            products: r.products.map(sid => sidMap[sid]),
        } as Reaction));
    }

    function generateReaction([reagent1, reagent2]: [SubstanceId, SubstanceId]) {
        const uniqueReagentsId = reagent1 * substanceMaxCount + reagent2;
        const rand = createRand(seed + uniqueReagentsId);
        return {
            reagents: [reagent1, reagent2],
            products:
                rand() < 0.5
                    ? [reagent1, reagent2]
                    : [
                        rand.rangeInt(substanceMaxCount),
                        ...(rand() < 0.3) ? [] : [
                            rand.rangeInt(substanceMaxCount),
                            ...(rand() < 0.7) ? [] : [
                                rand.rangeInt(substanceMaxCount),
                            ],
                        ]
                    ],
        } as Reaction;
    }

    function subreactions(subsids: number[]) {
        return reactions.filter((r) =>
            [...r.products, ...r.reagents].every((sid) => subsids.indexOf(sid) >= 0)
        );
    }

    function selectMostReactiveCore(sids: Iterable<SubstanceId[]>) {
        return apipe(sids,
            it.map(subset => ({ subset, len: subreactions(subset).length })),
            it.toArray(),
        ).sort((a, b) => b.len - a.len)[0].subset;
    }

    const substances = apipe(it.inf(), it.take(substanceMaxCount), it.toArray());

    const reactions = apipe(
        it.cross(substances, substances),
        it.map(generateReaction),
        it.filter(({ reagents, products }) => {
            const isReactionIntoSelf =
                reagents.length === products.length
                && reagents[0] === products[0]
                && reagents[1] === products[1];
            return !isReactionIntoSelf;
        }),
        it.toArray()
    );

    const sidRevMap = (() => {
        // find 5 sids with the biggest mutual reaction count
        const sidRevMap = selectMostReactiveCore(f5(substances));

        // among those 5, find 3 sids with the biggest mutual reaction count
        let sidRevMap1 = selectMostReactiveCore(f3(sidRevMap));

        // grow those 3 to 5
        while (sidRevMap1.length < sidRevMap.length) {
            sidRevMap1 = selectMostReactiveCore(f1p(sidRevMap, sidRevMap1));
        }

        // grow those 5 to max
        while (sidRevMap1.length < substances.length) {
            sidRevMap1 = selectMostReactiveCore(f1p(substances, sidRevMap1));
        }

        return sidRevMap1;
    })();

    return remapSids(reactions, sidRevMap);
}

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
    const tubes = useRecoilValue(tubesState);
    const mainTube = tubes[0];
    const currentSubstance = mainTube[mainTube.length - 1];
    const reactions = useRecoilValue(reactionsLibraryRecoil);

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

        const isPending = (() => {
            for (let i = 0; i < tubes.length; i++) {
                const tube = tubes[i];
                const r = reaction;

                if (tube.length > 2) {
                    return r.reagents[1] === tube[tube.length - 1]
                    && r.reagents[0] === tube[tube.length - 2]
                }
                if (tube.length > 1) {
                    return r.reagents[1] === tube[tube.length - 1]
                    && r.reagents[0] === tube[tube.length - 2]
                }
            }
        })();



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
                <div
                    class="material-symbols-rounded"
                    style={{
                        color: isPending ? "yellow" : "#ffffff30" || isApplicable ? "white" : "#ffffff30",
                        fontSize: "19px",
                        height: "18px",
                    }}
                >keyboard_arrow_up</div>
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
                }}> </div> }
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
