import { Router } from 'itty-router';
import { error, json } from 'itty-router-extras';
import { State } from '../../src/puzzle/state';
import { Env } from './Env';
import * as it from '../../src/utils/it';
import { apipe, pipe } from '../../src/utils/apipe';
import { tuple } from '../../src/utils/tuple';

type StatsKey = keyof State["stats"];
type StatData = Record<number, {
    all: number,
    unique: number,
}>;
type StatsData = Record<StatsKey, StatData>;


export const { entries, fromEntries } = Object;
export const entriesMap = <TKey, T, U>(f: (x: T, key: TKey) => U) =>
    it.map<[TKey, T], [TKey, U]>(([key, value]) => [key, f(value, key)]);
export const entriesEscalatePromises = <TKey, T>() =>
    it.map<[TKey, Promise<T>], Promise<[TKey, T]>>(async ([key, x]) => tuple(key, await x));
export const entriesPromisesAll = <TKey, T>() =>
    (s: Iterable<[TKey, Promise<T>]>) => apipe(s,
        entriesEscalatePromises(),
        x => Promise.all([...x]),
    );

export class Stats {
    constructor(
        public state: DurableObjectState,
        public env: Env,
    ) { }

    isSolutionRegistered = (() => {
        const storage = () => this.state.storage;
        const key = (solutionId: string, statKey: string) =>
            `isSolutionRegistered_${solutionId}_${statKey}`;
        return {
            get: (...args: Parameters<typeof key>) =>
                storage().get<true>(key(...args)),
            set: (...args: Parameters<typeof key>) =>
                storage().put(key(...args), true).then(() => true),
        }
    })();

    data = (() => {
        const storage = () => this.state.storage;
        const key = "data";
        const def = () => ({} as StatsData);
        return {
            get: async () => ((await storage().get<StatsData>(key)) ?? def()),
            set: (value: StatsData) => storage().put(key, value).then(() => value),
        }
    })();

    async add(solutionId: string, solutionStats: State["stats"]) {
        const { entries, fromEntries } = Object;

        const [isSolutionRegistered, data] = await Promise.all([
            (async () => fromEntries(await apipe(
                solutionStats,
                entries,
                entriesMap((_, key) => this.isSolutionRegistered.get(solutionId, key)),
                entriesPromisesAll(),
            )))(),
            this.data.get(),
        ] as const);

        for (const [key, stat] of entries(solutionStats)) {
            const _key = key as StatsKey;
            if (!data[_key]) { data[_key] = {}; }
            if (!data[_key][stat]) { data[_key][stat] = { all: 0, unique: 0 }; }
            
            data[_key][solutionStats[_key]].all++;
            if (!isSolutionRegistered[_key]) {
                data[_key][solutionStats[_key]].unique++;
            }
        
        }

        await Promise.all([
            (async () => fromEntries(await apipe(
                solutionStats,
                entries,
                entriesMap((_, key) => this.isSolutionRegistered.set(solutionId, key)),
                entriesPromisesAll(),
            )))(),
            this.data.set(data),
        ]);

        return {
            wasRegistered: isSolutionRegistered,
            data
        };
    }

    async getData() { return this.data.get(); }

    fetch = (() => {
        const router = Router()
            .post('/:target', async (request, env) => {
                const { target } = request.params!;
                const content = await request.json!();
                const ret = await (this as any)[target].apply(this, content);
                if (ret instanceof Response) { return ret; };
                return json(ret);
            });

        return (req: Request, env: Env) =>
            router
                .handle(req, env)
                .catch(err => {
                    console.error(err);
                    return error(500, err instanceof Error ? err.stack : err);
                });
    })()
}

export function clientifyRoutedStub<TDurableObject>(
    stub: DurableObjectStub
) {
    type GenericFunction<TS extends any[], R> = (...args: TS) => R
    type UnpackedPromise<T> = T extends Promise<infer U> ? U : T
    type Promisify<T> = {
        [K in keyof T]: T[K] extends GenericFunction<infer TS, infer R>
        ? (...args: TS) => Promise<UnpackedPromise<R>>
        : never
    }

    return new Proxy(stub, {
        get: (obj, prop) => {
            if (typeof prop !== "string") { return; }
            if (prop === "fetch") { return obj[prop]; }
            return async (...args: any[]): Promise<unknown> => (await obj.fetch(
                new Request(`https://durable/${prop}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(args)
                }))).json();
        }
    }) as unknown as Promisify<TDurableObject & DurableObjectStub>;
}

export function clientifyStatsStub(stub: DurableObjectStub) {
    return clientifyRoutedStub<Stats>(stub);
}
