import { Router } from 'itty-router';
import { json, error, withContent, status } from 'itty-router-extras';
import { isSolved } from "../../src/puzzle/actions";
import { evaluate, Solution } from "../../src/puzzle/evaluate";
import { puzzleId } from "../../src/puzzle/puzzleId";
import { Problem, getProblemCmp } from "../../src/puzzle/problem";
import { clientifyStatsStub } from './Stats';
import { Env } from './Env';
import SHA256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";
export { Stats } from './Stats';

export const getSolutionId = (actions: action[]) => {
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

function _throw(message: string) { throw new Error(message); }

const router = Router()
    .options('*', () => status(204))
    .get('/', async (req, env: Env) => {
        const q = new URL(req.url).searchParams;
        const problem = {
            puzzleId: q.get("puzzleId")!,
            seed: q.get("seed")!,
            substanceMaxCount: +(q.get("substanceMaxCount")!),
            substanceCount: +(q.get("substanceCount")!),
            ingredientCount: +(q.get("ingredientCount")!),
            targets: q.getAll("targets"),
        };
        const stats = getStatsStub(getProblemCmp(problem), env.STATS);
        return json(await stats.getData());
    })
    .post('/', withContent, async (req, env: Env) => {
        const soultion = (req as any).content as Solution;
        (soultion.problem.puzzleId === puzzleId)
            || _throw(`puzzleId ${soultion.problem.puzzleId} is not supprted`);
        const finalState = evaluate(soultion);
        if (!isSolved(finalState.state)) {
            throw new Error("the solution in not complete");
        }

        const stubStats = getStatsStub(getProblemCmp(solution.problem), env.STATS);
        return json(await stubStats.add(getSolutionId(solution), finalState.state.stats));
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
