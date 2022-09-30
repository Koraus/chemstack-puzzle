
export type StateTransition<TState, TDiffDesc = undefined> = {
    prevState: TState;
    state: TState;
    desc: TDiffDesc;
    start: number;
    duration: number;
};

import { Spec } from "immutability-helper";
export type Transition<TState, TDescription = undefined> = (
    { prev: TState, next: TState }
    | { prev: TState, diff: Spec<TState> }
    | { next: TState, diff: Spec<TState> }
    | { prev: TState, next: TState, diff: Spec<TState> }
) & {
    description: TDescription,
    duration: number,
    start: number,
}