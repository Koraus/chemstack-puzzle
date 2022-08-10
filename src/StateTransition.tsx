
export type StateTransition<TState, TDiffDesc = undefined> = {
    prevState: TState;
    state: TState;
    desc: TDiffDesc;
    start: number;
    duration: number;
};
