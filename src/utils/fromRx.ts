import * as rx from "rxjs";

export function fromRx<T, U>(op: rx.OperatorFunction<T, U>) {
    return function* (s: Iterable<T>) {
        let subscriber: rx.Subscriber<T>;
        let pool = [] as U[];
        new rx.Observable<T>(s => subscriber = s)
            .pipe(op)
            .subscribe(v => pool.push(v));

        for (const value of s) {
            subscriber!.next(value);
            yield* pool;
            if (subscriber!.closed) { return; }
            pool = [];
        }

        subscriber!.complete();
    };
}
