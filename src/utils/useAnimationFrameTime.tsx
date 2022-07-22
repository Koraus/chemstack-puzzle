import { useRxSubscribe } from "./useRxSubscribe";
import * as rx from "rxjs";
import { Inputs } from "preact/hooks";



export function useAnimationFrameTime(inputs?: Inputs) {
    return useRxSubscribe(() => rx.animationFrames(), inputs)?.elapsed ?? 0;
}
