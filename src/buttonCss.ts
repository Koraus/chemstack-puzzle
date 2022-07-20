import { css } from "@emotion/css";

export const buttonCss = css`
& {
    font-size: 100%;
    font-family: 'Bahnschrift', sans-serif;

    background-color: #ffffffff;
    border: none;
    border-radius: 4px;
    margin: 5px;
    padding: 5px;
}
& button:disabled {
    background-color: #ffffff90;
}
`;