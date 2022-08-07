import { css, cx } from "@emotion/css";
import * as flex from "./utils/flex";
import { Groups } from '@emotion-icons/material-rounded/Groups';
import { JSX } from "preact";

const shuffled = <T,>(arr: T[]) => {
    const arr1 = [...arr];
    const arr2 = [] as T[];
    while (arr1.length > 0) {
        const randomMemberIndex = Math.floor(Math.random() * arr1.length);
        arr2.push(arr1.splice(randomMemberIndex, 1)[0]);
    }
    return arr2;
}


export function AboutTeam({
    className, ...props
}: {
    style?: JSX.CSSProperties;
    className?: string;
}) {
    return <div
        className={cx(flex.col, css`$ {
            color: white;
            padding: 10px 30px;
            text-align: left;
            justify-content: center;
        }`, className)}
        {...props}
    >
        <Groups style={{ height: 30, width: 30 }} />
        {(() => {
            const team = [
                <div>Andrii Kashchynets</div>,
                <div>Viktor Kurochkin</div>,
                <div>Olena Stasiuk</div>,
                <div>Dmytro Kashchynets</div>,
            ];
            return shuffled(team);
        })()}
    </div>;
}

