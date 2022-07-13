import { css } from "@emotion/css";
import update from "immutability-helper";
import { atom, useRecoilTransaction_UNSTABLE, useRecoilValue } from 'recoil';
import { actionsState } from "./ActionLog";
import { levelState, Reaction, SubstanceId } from "./LevelEditor";
import { substanceColors } from "./substanceColors";
import * as flex from "./utils/flex";
import * as _ from "lodash";
import { Tube } from "./Tube";
type CSSProperties = import("preact").JSX.CSSProperties;


export const tubesState = atom({
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
    const tubes = useRecoilValue(tubesState);
    const { target, ingredients, reactions } = useRecoilValue(levelState);

    const addIngredient = useRecoilTransaction_UNSTABLE(({ get, set }) => (id: SubstanceId) => {
        let _tubes = tubes;
        _tubes = update(_tubes, { 0: { $push: [id] } });

        const { tubes: __tubes, log } = react(reactions, _tubes);

        set(tubesState, __tubes);
        set(actionsState, actions => update(actions, {
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

        set(tubesState, __tubes);
        set(actionsState, actions => update(actions, {
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

        set(tubesState, __tubes);
        set(actionsState, actions => update(actions, {
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

        set(tubesState, __tubes);
        set(actionsState, actions => update(actions, {
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

        set(tubesState, __tubes);
        set(actionsState, actions => update(actions, {
            $push: [
                `action: pourIntoActive`,
                ...log,
            ]
        }));
    });

    const isWin = tubes[0].length === target.length
        && tubes[0].every((_, i) => tubes[0][i] === target[i]);

    const ButtonPlaceholder = () => <button disabled style={{ visibility: "hidden" }}>.</button>;

    function IngredientButton({ sid, rev = false }: {
        sid: SubstanceId,
        rev?: boolean
    }) {
        return <button
            disabled={isWin}
            onClick={() => addIngredient(sid)}
            style={{
                transformOrigin: "50% 70%",
                transform: `rotate(${(rev ? -1 : 1) * 15}deg)`,
                borderRadius: "0px 0px 10px 10px",
            }}
        ><div style={{
            backgroundColor: substanceColors[sid],
            color: "#ffffffff",
            borderRadius: "0px 0px 5px 5px",
            width: "29px",
            height: "50px",
            fontSize: "35px",
            lineHeight: "62px",
        }}>{sid}</div></button>
    }

    return <div style={{
        backgroundColor: "#f4fff559",
        padding: "10px",
        ...flex.row,
    }}>
        <div style={{
            flex: 1,
            ...flex.col,
            justifyContent: "stretch",
        }}>
            <div style={{
                ...flex.row,
                justifyContent: "left",
            }}>
                {ingredients
                    .filter((_, i) => !(i % 2))
                    .map(sid => <IngredientButton sid={sid} />)}
            </div>
            <div style={{
                ...flex.rowRev,
                flexGrow: 1,
            }}>
                {tubes.length > 1 && <div>
                    <button
                        style={{
                            ...flex.row,
                        }}
                        disabled={isWin || !tubes[1] || tubes[0].length === 0}
                        onClick={pourFromActive}
                    >&lt;</button>
                    <button
                        style={{
                            ...flex.row,
                        }}
                        disabled={isWin || !tubes[1] || tubes[1].length === 0}
                        onClick={pourIntoActive}
                    >&gt;</button>
                </div>}
                {tubes.slice(1).map((t, i) => <Tube tube={t} />)}
            </div>
            <div>
                <button
                    style={{
                        ...flex.row,
                    }}
                    disabled={isWin}
                    onClick={addTube}
                ><div style={{
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
        </div>
        <div style={{
            flexShrink: 0,
        }}>
            <CraftingTube
                tube={tubes[0]}
                style={{
                    margin: "27px 10px 15px",
                }} />
        </div>
        <div style={{
            flex: 1,
            ...flex.col,
            justifyContent: "stretch",
        }}>
            <div style={{
                ...flex.row,
                justifyContent: "right",
            }}>
                {ingredients
                    .filter((_, i) => (i % 2))
                    .map(sid => <IngredientButton sid={sid} rev />)}
            </div>
            <div style={{
                flexGrow: 1,
                ...flex.row,
            }}>
                <div style={{ ...flex.col }}>
                    <Tube tube={target} isTarget={true} />
                </div>
            </div>
            <div style={{
                ...flex.row,
            }}>
                <button
                    style={{
                        ...flex.row,
                    }}
                    disabled={isWin || tubes.length <= 1}
                    onClick={trashTube}
                ><div style={{
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
            </div>
        </div>
    </div>

    return <div style={{
        backgroundColor: "#f4fff559",
        padding: "10px",
        ...flex.col,
    }}>



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

function CraftingTube({ tube, style }: {
    tube: SubstanceId[];
    style?: CSSProperties;
}) {
    function Slot({ i }: { i: number; }) {
        return <div style={{
            textAlign: "center",
            margin: `0px 6px 6px 6px`,
            width: `28px`,
            height: `56px`,
            border: "2px dashed #ffffff60",
            borderRadius: "5px",
            fontSize: "38px",
            lineHeight: "58px",
            color: "#ffffff60",
            backgroundColor: "#ffffff08",

            ...(i >= tube.length ? {} : {
                backgroundColor: substanceColors[tube[i]],
                color: "#ffffffff",
                borderColor: "transparent",
            }),

            ...(i !== 0 ? {} : {
                borderBottomLeftRadius: "15px",
                borderBottomRightRadius: "15px",
            }),
        }}>{i === tube.length ? ("+") : tube[i]}</div>;
    }

    return <div style={{
        ...flex.colRev,

        height: "220px",
        background: "#ffffff4d",
        borderRadius: "0px 0px 999px 999px",
        border: "6px solid white",
        borderTopColor: "#ffffff30",
        ...style,
    }}>
        <Slot i={0} />
        <Slot i={1} />
        <Slot i={2} />
    </div>
}