import { useRecoilValue } from 'recoil';
import { useState } from "preact/hooks";
type CSSProperties = import("preact").JSX.CSSProperties;
import { buttonCss } from './buttonCss';
import { solutionRecoil } from './craftingActionsRecoil';

export function ActionLog({ style }: { style?: CSSProperties }) {
    const actions = useRecoilValue(solutionRecoil)
        .actions
        .map(a => {
            switch (a.action) {
                case 'addIngredient': return `+ ${a.args![0]}`;
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
            // backgroundColor: "#f7f7f750",
            paddingLeft: "20px",
        }}>Action count: {actions.length}</h3>
        {/* <div style={{
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingBottom: "20px",
        }}>
            {[...actions].slice(0, 5).map(a => <>{a}<br /></>)}
            {(actions.length > 5) && <>{(() => <>
                {isOpen && [...actions].slice(5).map(a => <>{a}<br /></>)}
                <button 
                    className={buttonCss} 
                    onClick={() => setIsOpen(!isOpen)}
                >{isOpen ? "/\\" : `... (+${actions.length - 5})`}</button><br />
            </>)()}</>}
        </div> */}
    </div>;
}
