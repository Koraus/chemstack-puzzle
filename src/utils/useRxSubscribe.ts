import * as rx from "rxjs";
import { useEffect, useState, Inputs } from "preact/hooks";


export function useRxSubscribe<T>(
    sourceOrSourceFactory: rx.Observable<T> | (() => rx.Observable<T>),
    inputs?: Inputs
) {
    const [state, setState] = useState<T>();
    useEffect(() => {
        const source = ("subscribe" in sourceOrSourceFactory)
            ? sourceOrSourceFactory
            : sourceOrSourceFactory();
        const s = source.subscribe(setState);
        return () => s.unsubscribe();
    }, inputs);
    return state;
}
