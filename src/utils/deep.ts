import { apipe } from "./apipe";
import * as it from "./it";

export interface Tree<T> {
    [key: keyof any]: Tree<T> | T;
}

export function* deepEntries<T>(
    obj: Tree<T> | T, deepKey: (keyof any)[] = []
): Iterable<[deepKey: (keyof any)[], obj: Tree<T> | T]> {
    yield [deepKey, obj];
    if (typeof obj === "object") {
        const _obj = obj as Tree<T>;
        for (const k in _obj) {
            yield* deepEntries(_obj[k], [...deepKey, k]);
        }
    }
}

export const deepKeyOf = (obj: any, child: any) => {
    return apipe(deepEntries(obj),
        it.filter(([, c]) => c === child),
        it.first(),
    )?.[0];
}

export function deepKeyGet<T>(obj: Tree<T> | T, deepKey: (keyof any)[]): Tree<T> | T {
    if (deepKey.length === 0) { return obj; }
    return (deepKeyGet((obj as Tree<T>)[deepKey[0]], deepKey.filter((_, i) => i > 0)));
}
