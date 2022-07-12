import { useRecoilValue } from 'recoil';
import { useState } from "preact/hooks";
type CSSProperties = import("preact").JSX.CSSProperties;
import { atom } from "recoil";

export const actionsState = atom({
    key: "actions",
    default: [] as string[],
})


export function ActionLog({ style }: { style?: CSSProperties }) {
    const actions = useRecoilValue(actionsState);
    return <div style={{
        marginTop: "20px",
        backgroundColor: "#ffffff20",
        color: "white",
        ...style,
    }}>
        <h3 style={{
            margin: "0px",
            backgroundColor: "#ffffff50",
            paddingLeft: "20px",
        }}>&#x2022; Action log:</h3>
        <div style={{
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingBottom: "20px",
        }}>
            {[...actions].reverse().slice(0, 5).map(a => <>{a}<br /></>)}
            {(actions.length > 5) && <>{(() => {
                const [x, sx] = useState(false);
                return <>
                    {x && [...actions].reverse().slice(5).map(a => <>{a}<br /></>)}
                    <button onClick={() => sx(!x)}>{x ? "/\\" : `... (${actions.length - 5})`}</button><br />
                </>;
            })()}</>}
        </div>
    </div>;
}
