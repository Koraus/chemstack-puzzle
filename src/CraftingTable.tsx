import { css } from "@emotion/css";
import update from "immutability-helper";
import { atom, useRecoilTransaction_UNSTABLE, useRecoilValue } from 'recoil';
import { actionsAtom } from "./actionsAtom";
import { SubstanceId, target, ingredientSources, substances, reactions } from "./staticConfig";

export const tubesAtom = atom({
    key: "tubes",
    default: [[]] as SubstanceId[][],
})

const reactTube = (tube: SubstanceId[], i: number) => {
    const log = [] as string[];
    if (tube.length < 1) { return { tube, log }; }

    const ra = reactions.find(ra =>
        ra.reagents[1] === tube[tube.length - 1]
        && ra.reagents[0] === tube[tube.length - 2]);
    if (ra) {
        tube = update(tube, { $splice: [[tube.length - 2, 2, ...ra.products]] });
        log.push(`- reaction: tube #${i} ${JSON.stringify(ra)}`);
    }

    if (tube.length > 3) {
        tube = update(tube, { $splice: [[3]] });
        log.push(`- clean up: tube #${i} ${JSON.stringify(tube.slice(3))}`);
    }

    return { tube, log };
}

export const react = (tubes: SubstanceId[][]) => {
    const xxx = tubes.map(reactTube);
    for (let i = 0; i < xxx.length; i++) {
        tubes = update(tubes, { [i]: { $set: xxx[i].tube } });
    }

    return { tubes, log: xxx.flatMap(x => x.log) };
}

export function Ingredient({ id }: { id: SubstanceId }) {
    const hue = id / substances.length * 360;
    return <div style={{
        fontFamily: "Courier",
        padding: "4px 5px 2px",
        border: "1px solid",
        backgroundColor: `hsl(${hue}, 100%, 80%)`,
        color: `hsl(${hue}, 100%, 30%)`,
    }}>{id}</div>;
}

export function IngredientSlot({ ingrId }: { ingrId?: SubstanceId }) {
    return ingrId !== undefined
        ? <Ingredient id={ingrId} />
        : <div style={{
            fontFamily: "Courier",
            padding: "4px 5px 2px",
            border: "1px solid",
            color: "lightgrey",
        }}>-</div>
}

export function Tube({
    content, style,
}: {
    content: SubstanceId[],
    style?: preact.JSX.CSSProperties,
}) {
    return <div style={{
        padding: "5px",
        border: "1px solid",
        display: "flex",
        flexDirection: "column",
        height: "fit-content",
        ...style,
    }}>
        <IngredientSlot ingrId={content[2]} />
        <IngredientSlot ingrId={content[1]} />
        <IngredientSlot ingrId={content[0]} />
    </div>
}

export function CraftingTable() {
    const addIngredient = useRecoilTransaction_UNSTABLE(({ get, set }) => (id: SubstanceId) => {
        set(tubesAtom, tubes => update(tubes, { 0: { $push: [id] } }));
        set(actionsAtom, actions => update(actions, { $push: [`action: added ${id}`] }));

        const { tubes, log } = react(get(tubesAtom));

        set(tubesAtom, tubes);
        set(actionsAtom, actions => update(actions, { $push: log }));
    });

    const addTube = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        set(tubesAtom, tubes => update(tubes, { $splice: [[0, 0, []]] }));
        set(actionsAtom, actions => update(actions, { $push: [`action: added tube`] }));

        const { tubes, log } = react(get(tubesAtom));

        set(tubesAtom, tubes);
        set(actionsAtom, actions => update(actions, { $push: log }));
    });

    const trashTube = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        set(tubesAtom, tubes => update(tubes, { $splice: [[0, 1]] }));
        set(actionsAtom, actions => update(actions, { $push: [`action: trashed tube`] }));

        const { tubes, log } = react(get(tubesAtom));

        set(tubesAtom, tubes);
        set(actionsAtom, actions => update(actions, { $push: log }));
    });

    const pourRight = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        set(tubesAtom, tubes => update(tubes, {
            0: { $splice: [[tubes[0].length - 1]] },
            1: { $push: [tubes[0][tubes[0].length - 1]] },
        }));
        set(actionsAtom, actions => update(actions, { $push: [`action: pourRight`] }));

        const { tubes, log } = react(get(tubesAtom));

        set(tubesAtom, tubes);
        set(actionsAtom, actions => update(actions, { $push: log }));
    });

    const pourLeft = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        set(tubesAtom, tubes => update(tubes, {
            0: { $push: [tubes[1][tubes[1].length - 1]] },
            1: { $splice: [[tubes[1].length - 1]] },
        }));
        set(actionsAtom, actions => update(actions, { $push: [`action: pourRight`] }));

        const { tubes, log } = react(get(tubesAtom));

        set(tubesAtom, tubes);
        set(actionsAtom, actions => update(actions, { $push: log }));
    });

    const tubes = useRecoilValue(tubesAtom);
    const isWin = tubes[0].length === target.length
        && tubes[0].every((_, i) => tubes[0][i] === target[i]);

    const ButtonPlaceholder = () => <button disabled style={{ visibility: "hidden" }}>.</button>;

    return <div style={{
        backgroundColor: "hsl(120, 100%, 98%)",
        border: "1px solid",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
    }}>
        <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
        }}>
            <div>
                <button
                    disabled={isWin}
                    onClick={addTube}
                >+<br />Tube</button>
                {ingredientSources.map(id => <button
                    disabled={isWin}
                    onClick={() => addIngredient(id)}
                ><Ingredient id={id} />\/</button>)}
            </div>
        </div>


        <div style={{
            display: "flex",
            flexDirection: "row",
        }}>
            <div style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "right",
                flex: 1,
            }}>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                }}>
                    <ButtonPlaceholder />
                    <Tube style={{
                        backgroundColor: isWin ? "hsl(120, 100%, 90%)" : "hsl(0, 100%, 90%)",
                    }} content={target} />
                </div>
            </div>

            <div style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "left",
                flex: 3,
            }}>
                {tubes.map((t, i) => <div style={{
                    display: "flex",
                    flexDirection: "column",
                }}>
                    {i !== 0 && i !== 1 &&
                        <ButtonPlaceholder />}
                    {i === 0 && tubes.length === 1 &&
                        <ButtonPlaceholder />}
                    {(i === 0) && (tubes.length > 1) && <button
                        disabled={isWin || tubes[0].length === 0}
                        onClick={pourRight}
                    >&gt;</button>}
                    {(i === 1) && (tubes.length > 1) && <button
                        disabled={isWin || tubes[1].length === 0}
                        onClick={pourLeft}
                    >&lt;</button>}

                    <Tube content={t} />

                    {(i === 0) && <button
                        disabled={isWin || tubes.length <= 1}
                        onClick={trashTube}
                    >X</button>}
                </div>)}
            </div>


        </div>

    </div >;
}
