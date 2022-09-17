import { atom, useRecoilValue, useSetRecoilState } from "recoil";
import { useMatchMedia } from "./utils/useMatchMedia";

type Orientation = "landscape" | "portrait";

export const landscapeWidth = 922;
export const portraitWidth = 414;

export const orientationRecoil = atom({
    key: "orientation",
    default: "landscape" as Orientation,
});

export const useOrientationEffect = () => {
    const set = useSetRecoilState(orientationRecoil);
    const isLandscape = useMatchMedia(`(orientation: landscape)`
        + ` and (min-width: ${landscapeWidth}px)`
        + ` and (min-height: 487px)`);
    set(isLandscape ? "landscape" : "portrait");
}

export const useOrientationValue = () => useRecoilValue(orientationRecoil);
export const useIsLandscapeValue = () => useOrientationValue() === "landscape";
