import { css } from "@emotion/css";

export const colS = { display: "flex", flexDirection: "column" };
export const colRevS = { display: "flex", flexDirection: "column-reverse" };
export const rowS = { display: "flex", flexDirection: "row" };
export const rowRevS = { display: "flex", flexDirection: "row-reverse" };

export const col = css`& { display: flex; flex-direction: column; }`;
export const colRev = css`& { display: flex; flex-direction: column-reverse; }`;
export const row = css`& { display: flex; flex-direction: row; }`;
export const rowRev = css`& { display: flex; flex-direction: row-reverse; }`;