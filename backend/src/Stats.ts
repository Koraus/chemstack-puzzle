import { Router } from 'itty-router';
import { error, json } from 'itty-router-extras';
import { State } from '../../src/puzzle/state';
import { Env } from './Env';

type StatsData = {
    actionCount: Record<number, {
        all: number,
        unique: number,
    }>;
}

export class Stats {
    constructor(
        public state: DurableObjectState,
        public env: Env,
    ) { }

    isSolutionRegistered = (() => {
        const storage = () => this.state.storage;
        const key = (solutionId: string, statKey: keyof StatsData) =>
            `isSolutionRegistered_${solutionId}_${statKey}`;
        return {
            get: (...args: Parameters<typeof key>) =>
                storage().get<true>(key(...args)),
            set: (...args: Parameters<typeof key>) =>
                (storage().put(key(...args), true), true),
        }
    })();

    data = (() => {
        const storage = () => this.state.storage;
        const key = "data";
        const def = () => ({
            actionCount: {},
        });
        return {
            get: async () => ((await storage().get<StatsData>(key)) ?? def()),
            set: (value: StatsData) => (storage().put(key, value), value),
        }
    })();

    async add(solutionId: string, solutionStats: State["stats"]) {
        const [isSolutionRegisteredForActionCount, data] = await Promise.all([
            this.isSolutionRegistered.get(solutionId, "actionCount"),
            this.data.get(),
        ] as const);

        if (!data.actionCount[solutionStats.actionCount]) {
            data.actionCount[solutionStats.actionCount] = {
                all: 0,
                unique: 0,
            };
        }

        data.actionCount[solutionStats.actionCount].all++;
        if (isSolutionRegisteredForActionCount) {
            data.actionCount[solutionStats.actionCount].unique++;
        }

        this.data.set(data);
        this.isSolutionRegistered.set(solutionId, "actionCount");

        return {
            wasRegistered: isSolutionRegisteredForActionCount,
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
