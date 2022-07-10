import { useRecoilValue } from 'recoil';
import { useState } from "preact/hooks";
type CSSProperties = import("preact").JSX.CSSProperties;
import { atom } from "recoil";

export const actionsAtom = atom({
    key: "actions",
    default: [] as string[],
})


export function ActionLog({ style }: { style?: CSSProperties }) {
    const actions = useRecoilValue(actionsAtom);
    return <div style={style}>
        <h3 style={{ marginBottom: "0px" }}>Action log:</h3>
        {[...actions].reverse().slice(0, 5).map(a => <>{a}<br /></>)}
        {(actions.length > 5) && <>{(() => {
            const [x, sx] = useState(false);
            return <>
                {x && [...actions].reverse().slice(5).map(a => <>{a}<br /></>)}
                <button onClick={() => sx(!x)}>{x ? "/\\" : `... (${actions.length - 5})`}</button><br />
            </>;
        })()}</>}
    </div>;
}
