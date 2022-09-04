import { Router } from 'itty-router';
import { json, error, withContent, status } from 'itty-router-extras';
import { isSolved } from "../../src/puzzle/actions";
import { evaluate } from "../../src/puzzle/evaluate";
import { puzzleId } from "../../src/puzzle/puzzleId";
import { getProblemCmp } from "../../src/puzzle/problem";
import { clientifyStatsStub } from './Stats';
import { Env } from './Env';
import SHA256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";
import { getSolutionCmp, Solution } from '../../src/puzzle/solution';
export { Stats } from './Stats';

function _throw(message?: string) { throw new Error(message); }
function assertSolution(solution: any): Solution {
    ("problem" in solution)
        || _throw("problem key is missing");
    ("string" === typeof solution.problem.puzzleId)
        || _throw("prbolem.puzzleId is not string");
    ("string" === typeof solution.problem.seed)
        || _throw("prbolem.seed is not string");
    ("number" === typeof solution.problem.substanceMaxCount)
        || _throw("prbolem.substanceMaxCount is not number");
    ("number" === typeof solution.problem.substanceCount)
        || _throw("prbolem.substanceCount is not number");
    ("number" === typeof solution.problem.ingredientCount)
        || _throw("prbolem.ingredientCount is not number");
    Array.isArray(solution.problem.targets)
        || _throw("prolem.targets in not array");
    for (const { target, i } of (solution.problem.targets as any[]).map((target, i) => ({ target, i }))) {
        ("string" === typeof target)
            || _throw(`prolem.targets[${i}] is not string`);
    }

    Array.isArray(solution.actions)
        || _throw("actions is not array");
    for (const { action, i } of (solution.actions as any[]).map((action, i) => ({ action, i }))) {
        switch (action.action) {
            case "addIngredient": {
                Array.isArray(action.args)
                    || _throw(`actions[${i}].args is not array`);
                ("number" === typeof action.args[0])
                    || _throw(`actions[${i}].args[0] is not number`);
                break;
            }
            case "addTube": {
                Array.isArray(action.args)
                    || _throw(`actions[${i}].args is not array`);
                break;
            }
            case "trashTube": {
                Array.isArray(action.args)
                    || _throw(`actions[${i}].args is not array`);
                break;
            }
            case "pourFromMainIntoSecondary": {
                Array.isArray(action.args)
                    || _throw(`actions[${i}].args is not array`);
                break;
            }
            case "pourFromSecondaryIntoMain": {
                Array.isArray(action.args)
                    || _throw(`actions[${i}].args is not array`);
                break;
            }
            case "swapTubes": {
                Array.isArray(action.args)
                    || _throw(`actions[${i}].args is not array`);
                break;
            }
            default: _throw(`actions[${i}].action is unkonwn`);
        }
    }

    return solution;
}


export function getStatsStub(
    name: string,
    env: Env,
) {
    const id = env.STATS.idFromName(name);
    const stub = env.STATS.get(id);
    return clientifyStatsStub(stub);
}
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
        const stats = getStatsStub(getProblemCmp(problem), env);
        return json(await stats.getData());
    })
    .post('/', withContent, async (req, env: Env) => {
        const solution = assertSolution((req as any).content);
        (solution.problem.puzzleId === puzzleId)
            || _throw(`puzzleId ${solution.problem.puzzleId} is not supported`);
        const finalState = evaluate(solution);
        isSolved(finalState.state)
            || _throw("the solution in not complete");

        const stubStats = getStatsStub(getProblemCmp(solution.problem), env);
        return json(await stubStats.add(
            SHA256(getSolutionCmp(solution)).toString(Hex),
            finalState.state.stats));
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
