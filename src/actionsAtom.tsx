import { atom } from "recoil";

export const actionsAtom = atom({
    key: "actions",
    default: [] as string[],
})
