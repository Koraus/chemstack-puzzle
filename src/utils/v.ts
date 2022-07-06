// function readonlify<TOut, TArgs extends any[]>(
//     f: (out: TOut, ...args: TArgs) => TOut,
//     create: () => TOut
// ) {
//     return (...args: TArgs) => f(create(), ...args);
// }

type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;
type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;

export function v<D extends 1 | 2 | 3 | 4 | 5 | 6 | 7>(d: D) {
    type vd = Tuple<number, D>;
    type rvd = Readonly<vd>;
    const vd = {
        from: (...v: rvd) => [...v] as vd,
        zero: () => Array.from({length: d}, () => 0) as vd,
        ones: () => Array.from({length: d}, () => 1) as vd,
        one: (i: number) => Array.from({length: d}, (_, _i) => Number(i === _i)) as vd,

        add: (a: rvd, b: rvd) => a.map((_, i) => a[i] + b[i]) as vd,
        scale: (a: rvd, b: number) => a.map((_, i) => a[i] * b) as vd,
        dot: (a: rvd, b: rvd) => a.map((_, i) => a[i] * b[i]).reduce((acc, v) => acc + v, 0),
        eqStrict: (a: rvd, b: rvd) => a.every((_, i) => a[i] === b[i]),
        
        negate: (a: rvd) => vd.scale(a, -1),
        sub: (a: rvd, b: rvd) => vd.add(a, vd.negate(b)),
        lenSq: (v: rvd) => vd.dot(v, v),
        len: (v: rvd) => Math.sqrt(vd.lenSq(v)),
        norm: (v: rvd) => vd.scale(v, 1 / vd.len(v)),
        distSq: (a: rvd, b: rvd) => vd.lenSq(vd.sub(b, a)),
        dist: (a: rvd, b: rvd) => vd.len(vd.sub(b, a)),
        eq: (a: rvd, b: rvd, eps = 0) => vd.dist(a, b) <= eps,
    }
    return vd;
}

export type v2 = Tuple<number, 2>;
export const v2 = v(2);
export type v3 = Tuple<number, 3>;
export const v3 = v(3);