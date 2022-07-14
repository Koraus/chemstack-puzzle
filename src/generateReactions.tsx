import { apipe } from "./utils/apipe";
import { createRand } from "./utils/createRand";
import * as it from "./utils/it";
import { SubstanceId, Reaction } from './LevelEditor';

function* f1p<T>(all: T[], sub: T[]) {
    const rest = all.filter(x => sub.indexOf(x) < 0);
    for (let i = 0; i < rest.length; i++) {
        yield [...sub, rest[i]];
    }
}

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

export function generateReactions({ seed, substanceMaxCount }: {
    seed: string;
    substanceMaxCount: number;
}) {
    function generateReaction([reagent1, reagent2]: [SubstanceId, SubstanceId]) {
        const uniqueReagentsId = reagent1 * substanceMaxCount + reagent2;
        const rand = createRand(seed + uniqueReagentsId);
        return {
            reagents: [reagent1, reagent2],
            products: [
                rand.rangeInt(substanceMaxCount),
                ...(rand() < 0.5) ? [] : [
                    rand.rangeInt(substanceMaxCount),
                    ...(rand() < 0.5) ? [] : [
                        rand.rangeInt(substanceMaxCount),
                    ],
                ]
            ]
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
        it.zip(substances, substances),
        it.map(generateReaction),
        it.filter(
            ({ reagents: r, products: p }) => (r[0] !== p[0]) && (r[1] !== p[1])),
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
