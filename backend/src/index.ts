import { Router } from 'itty-router';
import { json, error, withContent, status } from 'itty-router-extras';
import { CraftingAction, craftingReduce } from "../../src/crafting";
import { levelPresets } from "../../src/levelPresets";
import { getProblemReactions } from '../../src/puzzle/reactions';
import { getProblemTargets } from "../../src/puzzle/targets";
import { clientifyStatsStub } from './Stats';
import { Env } from './Env';
import SHA256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";
export { Stats } from './Stats';


type LevelPreset = Omit<typeof levelPresets[0], "name">;
type CraftingStateInTime =
    ReturnType<typeof craftingReduce>
    | { state: Parameters<typeof craftingReduce>[2]; };

export const getLevelPresetId = ({
    seed,
    substanceMaxCount,
    substanceCount,
    ingredientCount,
    targets,
}: LevelPreset) => JSON.stringify({
    // order matters
    seed,
    substanceMaxCount,
    substanceCount,
    ingredientCount,
    targets,
});

export const getSolutionId = (actions: CraftingAction[]) => {
    const cleanedAnsSorted = actions.map(action => {
        if (action.action === 'addIngredient') {
            return {
                action: action.action,
                ingredientId: action.ingredientId,
            }
        }
        return ({
            action: action.action,
        });
    });
    const s = JSON.stringify(cleanedAnsSorted);
    return SHA256(s).toString(Hex);
}


export function getStatsStub(
    name: string,
    ns: DurableObjectNamespace,
) {
    const id = ns.idFromName(name);
    const stub = ns.get(id);
    return clientifyStatsStub(stub);
}

const router = Router()
    .options('*', () => status(204))
    .get('/', async (req, env: Env) => {
        const q = new URL(req.url).searchParams;
        const levelPreset = {
            seed: q.get("seed")!,
            substanceMaxCount: +(q.get("substanceMaxCount")!),
            substanceCount: +(q.get("substanceCount")!),
            ingredientCount: +(q.get("ingredientCount")!),
            targets: q.getAll("targets"),
        };
        const stats = getStatsStub(getLevelPresetId(levelPreset), env.STATS);
        return json(await stats.getData());
    })
    .post('/', withContent, async (req, env: Env) => {
        const content = (req as any).content;
        const {
            levelPreset,
            solution,
        } = content as {
            levelPreset: LevelPreset,
            solution: CraftingAction[],
        };

        const reactions = getProblemReactions(levelPreset);
        const targets = getProblemTargets(levelPreset);
        const finalState = solution.reduce(
            (prev, action) => craftingReduce({ reactions }, action, prev.state),
            { state: { tubes: [[]], targets, isSolved: false } } as CraftingStateInTime);

        if (!finalState.state.isSolved) {
            throw new Error("the solution in not complete");
        }

        const stats = getStatsStub(getLevelPresetId(levelPreset), env.STATS);
        return json(await stats.add(getSolutionId(solution), {
            actionCount: solution.length,
        }));
    });

export default {
    fetch: (request: Request, env: Env) =>
        router
            .handle(request, env)
            .then((response: Response) => {
                const corsHeaders = {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'authorization, referer, origin, content-type',
                    'Access-Control-Max-Age': '3600',
                };

                for (const [k, v] of Object.entries(corsHeaders)) {
                    response.headers.set(k, v);
                }
                return response;
            })
            .catch(err => {
                console.error(err);
                return error(500, err instanceof Error ? err.stack : err);
            }),
}
