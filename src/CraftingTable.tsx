import { css } from "@emotion/css";
import update from "immutability-helper";
import { atom, useRecoilTransaction_UNSTABLE, useRecoilValue } from 'recoil';
import { actionsAtom } from "./ActionLog";
import { levelState, Reaction, SubstanceId } from "./LevelConfigEditor";
import { substanceColors } from "./substanceColors";
import * as flex from "./utils/flex";
import * as _ from "lodash";
import { Tube } from "./Tube";

export const tubesAtom = atom({
    key: "tubes",
    default: [[]] as SubstanceId[][],
})

const reactTube = (reactions: Reaction[], tube: SubstanceId[], i: number) => {
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

export const react = (reactions: Reaction[], tubes: SubstanceId[][]) => {
    const xxx = tubes.map((tube, i) => reactTube(reactions, tube, i));
    for (let i = 0; i < xxx.length; i++) {
        tubes = update(tubes, { [i]: { $set: xxx[i].tube } });
    }

    return { tubes, log: xxx.flatMap(x => x.log) };
}


export function CraftingTable() {
    const tubes = useRecoilValue(tubesAtom);
    const { target, ingredients, reactions } = useRecoilValue(levelState);

    const addIngredient = useRecoilTransaction_UNSTABLE(({ get, set }) => (id: SubstanceId) => {
        let _tubes = tubes;
        _tubes = update(_tubes, { 0: { $push: [id] } });

        const { tubes: __tubes, log } = react(reactions, _tubes);

        set(tubesAtom, __tubes);
        set(actionsAtom, actions => update(actions, {
            $push: [
                `action: added ${id}`,
                ...log,
            ]
        }));
    });

    const addTube = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        let _tubes = tubes;
        _tubes = update(tubes, { $splice: [[0, 0, []]] });

        const { tubes: __tubes, log } = react(reactions, _tubes);

        set(tubesAtom, __tubes);
        set(actionsAtom, actions => update(actions, {
            $push: [
                `action: added tube`,
                ...log,
            ]
        }));
    });

    const trashTube = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        let _tubes = tubes;
        _tubes = update(tubes, { $splice: [[0, 1]] });

        const { tubes: __tubes, log } = react(reactions, _tubes);

        set(tubesAtom, __tubes);
        set(actionsAtom, actions => update(actions, {
            $push: [
                `action: trashed tube`,
                ...log,
            ]
        }));
    });

    const pourFromActive = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        let _tubes = tubes;
        _tubes = update(tubes, {
            0: { $splice: [[tubes[0].length - 1]] },
            1: { $push: [tubes[0][tubes[0].length - 1]] },
        });

        const { tubes: __tubes, log } = react(reactions, _tubes);

        set(tubesAtom, __tubes);
        set(actionsAtom, actions => update(actions, {
            $push: [
                `action: pourFromActive`,
                ...log,
            ]
        }));
    });

    const pourIntoActive = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        let _tubes = tubes;
        _tubes = update(tubes, {
            0: { $push: [tubes[1][tubes[1].length - 1]] },
            1: { $splice: [[tubes[1].length - 1]] },
        });

        const { tubes: __tubes, log } = react(reactions, _tubes);

        set(tubesAtom, __tubes);
        set(actionsAtom, actions => update(actions, {
            $push: [
                `action: pourIntoActive`,
                ...log,
            ]
        }));
    });

    const isWin = tubes[0].length === target.length
        && tubes[0].every((_, i) => tubes[0][i] === target[i]);

    const ButtonPlaceholder = () => <button disabled style={{ visibility: "hidden" }}>.</button>;

    return <div style={{
        backgroundColor: "#f4fff559",
        padding: "10px",
        ...flex.col,
    }}>
        <div style={{
            ...flex.row,
            justifyContent: "center",
        }}>
            <div>
                {ingredients.map(sid => <button
                    style={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "4px",
                        margin: "5px",
                        padding: "5px",
                    }}
                    disabled={isWin}
                    onClick={() => addIngredient(sid)}
                ><div style={{
                    backgroundColor: substanceColors[sid],
                    color: "#ffffffff",
                    borderRadius: "2px",
                    width: "24px",
                    height: "30px",
                    fontSize: "19px",
                    fontFamily: "Bahnschrift",
                    lineHeight: "32px",
                }}>{sid}</div><div style={{
                    fontFamily: "Bahnschrift",
                    fontSize: "19px",
                    lineHeight: "22px",
                    height: "18px",
                }}>+</div></button>)}
            </div>
        </div>


        <div style={{ ...flex.row }}>

            <div style={{
                ...flex.rowRev,
                justifyContent: "right",
                flex: 7,
            }}>
                {tubes.slice(1).map((t, i) => <div style={{ ...flex.col }}>
                    <ButtonPlaceholder />
                    <Tube tube={t} />
                </div>)}
            </div>


            <div style={{
                flex: 2,
            }}>
                <button
                    style={{
                        ...flex.row,
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "4px",
                        margin: "5px",
                        padding: "5px",
                    }}
                    disabled={isWin || !tubes[1] || tubes[0].length === 0}
                    onClick={pourFromActive}
                >&lt;</button>
                <button
                    style={{
                        ...flex.row,
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "4px",
                        margin: "5px",
                        padding: "5px",
                    }}
                    disabled={isWin || !tubes[1] || tubes[1].length === 0}
                    onClick={pourIntoActive}
                >&gt;</button>
            </div>

            <div style={{
                ...flex.row,
            }}><Tube tube={tubes[0]} isActive={true} w={24} /></div>

            <div style={{
                flex: 2,
            }}>
                <button
                    style={{
                        ...flex.row,
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "4px",
                        margin: "5px",
                        padding: "5px",
                    }}
                    disabled={isWin || tubes.length <= 1}
                    onClick={trashTube}
                ><div style={{
                    fontFamily: "Bahnschrift",
                    fontSize: "19px",
                    lineHeight: "22px",
                    height: "18px",
                    color: "red",
                }}>x</div><div style={{
                    width: "10px",
                    height: "26px",
                    backgroundColor: "#dddddd",
                    borderRadius: "0px 0px 999px 999px",
                }}></div></button>
                <button
                    style={{
                        ...flex.row,
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "4px",
                        margin: "5px",
                        padding: "5px",
                    }}
                    disabled={isWin}
                    onClick={addTube}
                ><div style={{
                    fontFamily: "Bahnschrift",
                    fontSize: "19px",
                    lineHeight: "22px",
                    height: "18px",
                }}>+</div><div style={{
                    width: "10px",
                    height: "26px",
                    backgroundColor: "#dddddd",
                    borderRadius: "0px 0px 999px 999px",
                }}></div></button>
            </div>

            <div style={{
                ...flex.row,
                justifyContent: "left",
                flex: 7,
            }}>
                <div style={{ ...flex.col }}>
                    <ButtonPlaceholder />
                    <Tube tube={target} isTarget={true} />
                </div>
            </div>

        </div>
        <div style={{ height: "50px" }}></div>
    </div>;
}

