import * as _ from "lodash";
import update, { Spec } from "immutability-helper";
import * as it from "./utils/it";
import { atom, useRecoilState } from 'recoil';
import { SHA256, enc } from "crypto-js";
import { css } from "@emotion/css";

const randomIntFactory = (seed: string) => {
    let arr = SHA256(seed).words;
    let i = 0;
    return () => {
        if (i === arr.length - 1) {
            i = 0;
            arr = SHA256(arr[i].toString()).words;
        }
        return arr[i++] >>> 0;
    };
}

const seed = 4242;
const ingredients = Array.from({ length: 4 })
    .map((_, i) => enc.Hex.stringify(SHA256(i.toString())).substring(0, 6));
const randomInt = randomIntFactory((seed).toString());
const randomIngredient = () => ingredients[randomInt() % ingredients.length];

const reactions = (() => {
    const randomReaction = () => [[
        randomIngredient(),
        randomIngredient(),
    ], [
        randomIngredient(),
        ...(randomInt() % 2) ? [] : [
            randomIngredient(),
            ...(randomInt() % 2) ? [] : [
                randomIngredient(),

            ],
        ],
    ]] as [[string, string], [string] | [string, string] | [string, string, string]];

    const arr = [randomReaction()];
    while (arr.length < 10) {
        const reaction = randomReaction();
        if (arr.some(r1 => (r1[0][0] === reaction[0][0]) && (r1[0][1] === reaction[0][1]))) {
            continue;
        }
        arr.push(reaction);
    }
    return arr;
})();

const target = (() => {
    randomInt();
    while (true) {
        const target = [
            randomIngredient(),
            randomIngredient(),
            randomIngredient(),
        ];
        const some1 = reactions.some(ra =>
            ra[0][1] === target[1]
            && ra[0][0] === target[0]);
        if (some1) { continue; }
        const some2 = reactions.some(ra =>
            ra[0][1] === target[2]
            && ra[0][0] === target[1]);
        if (some2) { continue; }

        return target;
    }
})()


const stateAtom = atom({
    key: "state",
    default: {
        ingredientSources: ingredients.slice(0, 3),
        reactions,
        target,
        tubes: [
            [],
        ] as string[][],
        actions: [] as string[],
    },
});

export function Ingredient({ id }: { id: string }) {
    const hue = (SHA256(id).words[0] >>> 0) % 360;
    return <div style={{
        fontFamily: "Courier",
        backgroundColor: `hsl(${hue}, 100%, 80%)`,
        padding: "5px 10px 2px 10px",
        border: "1px solid",
        color: `hsl(${hue}, 100%, 30%)`,
    }}>{id}</div>;
}

export function TubeSlot({ ingrId }: { ingrId?: string }) {
    return ingrId
        ? <Ingredient id={ingrId} />
        : <div style={{
            fontFamily: "Courier",
            padding: "5px 10px 2px 10px",
            border: "1px solid",
        }}>...</div>
}

export function Tube({ name, content }: { name: string, content: string[] }) {
    return <div style={{
        width: "80px",
        padding: "5px",
        border: "1px solid",
        display: "inline-block",
    }}>
        <h3>{name}</h3>
        <TubeSlot ingrId={content[2]} />
        <TubeSlot ingrId={content[1]} />
        <TubeSlot ingrId={content[0]} />
    </div>
}

export function App() {
    const [state, setState] = useRecoilState(stateAtom);

    const react = (s: typeof state) => {
        let s1 = s;
        const rs = s1.tubes.map(t => {
            if (t.length < 1) { return; }
            return s1.reactions.find(ra =>
                ra[0][1] === t[t.length - 1]
                && ra[0][0] === t[t.length - 2]);
        })
        for (let i = 0; i < s1.tubes.length; i++) {
            const ra = rs[i];
            const t = s1.tubes[i];
            if (ra) {
                s1 = update(s1, {
                    tubes: {
                        [i]: {
                            $splice: [[t.length - 2, 2, ...ra[1]]]
                        }
                    },
                    actions: { $push: [`- reaction: tube #${i} ${JSON.stringify(ra)}`] }
                })
            }
        }
        for (let i = 0; i < s1.tubes.length; i++) {
            const t = s1.tubes[i];
            if (t.length > 3) {
                s1 = update(s1, {
                    tubes: {
                        [i]: {
                            $splice: [[3]]
                        }
                    },
                    actions: { $push: [`- clean up: tube #${i} ${JSON.stringify(t.slice(3))}`] }
                })
            }
        }
        return s1;
    }

    const addIngredient = (id: string) => {
        let s1 = state;
        s1 = (update(s1, {
            tubes: { 0: { $push: [id] } },
            actions: { $push: [`action: added ${id}`] },
        }));
        s1 = react(s1);
        setState(s1);
    }

    const addTube = () => {
        let s1 = state;
        s1 = (update(s1, {
            tubes: { $splice: [[0, 0, []]] },
            actions: { $push: [`action: added tube`] },
        }));
        s1 = react(s1);
        setState(s1);
    }

    const trashTube = () => {
        let s1 = state;
        s1 = (update(s1, {
            tubes: { $splice: [[0, 1]] },
            actions: { $push: [`action: trashed tube`] },
        }));
        s1 = react(s1);
        setState(s1);
    }

    const poorRight = () => {
        let s1 = state;
        s1 = (update(s1, {
            tubes: {
                0: { $splice: [[s1.tubes[0].length - 1]] },
                1: { $push: [s1.tubes[0][s1.tubes[0].length - 1]] },
            },
            actions: { $push: [`action: poorRight`] },
        }));
        s1 = react(s1);
        setState(s1);
    }

    const poorLeft = () => {
        let s1 = state;
        s1 = (update(s1, {
            tubes: {
                0: { $push: [s1.tubes[1][s1.tubes[1].length - 1]] },
                1: { $splice: [[s1.tubes[1].length - 1]] },
            },
            actions: { $push: [`action: poorLeft`] },
        }));
        s1 = react(s1);
        setState(s1);
    }

    const isWin =
        state.tubes[0].length === target.length
        && state.tubes[0].every((_, i) => state.tubes[0][i] === target[i]);

    return <div className={css`
        & button { font-size: 100% }
    `} style={{
        backgroundColor: isWin ? "hsl(120, 100%, 90%)" : undefined,
    }}>
        <h2>Available ingredients (click to add):</h2>
        {state.ingredientSources.map(id => <button
            disabled={isWin}
            onClick={() => addIngredient(id)}
        ><Ingredient id={id} /></button>)}

        <h2>Crafting table:</h2>
        <div style={{
            display: "flex",
        }}>
            <div style={{
                backgroundColor: isWin ? "hsl(120, 100%, 90%)" : "hsl(0, 100%, 90%)",
                height: "fit-content",
            }}><Tube content={state.target} name="Target" /></div>
            <div>{Array.from({ length: 10 }, () => <>&nbsp;&lt;&lt;&nbsp;<br /></>)}</div>

            <div>
                {state.tubes.map((t, i) => <Tube content={t} name={`Tube #${i}`} />)}
                {state.tubes.length > 1 && <>
                    <br />
                    <button
                        disabled={isWin || state.tubes[0].length === 0}
                        onClick={poorRight}
                    >Poor right &gt;</button>
                    <button
                        disabled={isWin || state.tubes[1].length === 0}
                        onClick={poorLeft}
                    >&lt; Poor left</button>
                </>}
                <br />
                <button
                    disabled={isWin || state.tubes.length <= 1}
                    onClick={trashTube}
                >Trash tube</button>
                <button
                    disabled={isWin}
                    onClick={addTube}
                >Add tube</button>
            </div>

        </div>

        <h2>Reactions:</h2>
        {state.reactions.map((r, i) => <div>
            {r[0].map(ingrId => <div style={{
                display: "inline-block",
            }}><Ingredient id={ingrId} /></div>)} =&gt; {r[1].map(ingrId => <div style={{
                display: "inline-block",
            }}><Ingredient id={ingrId} /></div>)}
        </div>)}

        <h2>Actions:</h2>
        {state.actions.map(a => <>{a}<br /></>)}

        <h2>Statistics:</h2>
        <div>
            Action count: {state.actions.filter(a => a.match(/^action/)).length}
        </div>
        <div>
            Ingredients used:
            {
                Object.entries(
                    state.actions
                        .map(a => a.match(/^action: added (.*)/))
                        .reduce(
                            (acc, m) => m
                                ? { ...acc, [m[1]]: (acc[m[1]] ?? 0) + 1 }
                                : acc,
                            {} as Record<string, number>)
                ).map(([id, count]) => <div style={{
                    display: "flex",
                }}>
                    <Ingredient id={id} />&nbsp;x {count}
                </div>)
            }
        </div>
    </div>
}

