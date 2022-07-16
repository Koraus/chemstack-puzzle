import { useRecoilValue } from 'recoil';
import { useState } from "preact/hooks";
type CSSProperties = import("preact").JSX.CSSProperties;
import { craftingActionsRecoil } from './CraftingTable';

export function ActionLog({ style }: { style?: CSSProperties }) {
    const actions = useRecoilValue(craftingActionsRecoil)
        .map(a => {
            switch (a.action) {
                case 'addIngredient': return `+ ${a.ingredientId}`;
                case 'addTube': return "+ tube";
                case 'trashTube': return "x tube";
                case 'pourFromMainIntoSecondary': return 'pour <-';
                case 'pourFromSecondaryIntoMain': return 'pour ->';
            }
            return JSON.stringify(a);
        }).reverse();
    const [isOpen, setIsOpen] = useState(false);
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
            {[...actions].slice(0, 5).map(a => <>{a}<br /></>)}
            {(actions.length > 5) && <>{(() => <>
                {isOpen && [...actions].slice(5).map(a => <>{a}<br /></>)}
                <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? "/\\" : `... (+${actions.length - 5})`}</button><br />
            </>)()}</>}
        </div>
    </div>;
}
