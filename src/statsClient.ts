import { Problem } from './puzzle/problem';
import { Solution } from './puzzle/solution';
import { State } from './puzzle/state';


export type StatsKey = keyof State["stats"];
export type StatData = Record<number, {
    all: number,
    unique: number,
}>;
export type StatsData = Record<StatsKey, StatData>;

const useProdBackInDev = true;
const backUrl =
    (useProdBackInDev || !import.meta.env.DEV)
        ? "https://chems.x-pl.art/"
        : "http://127.0.0.1:8787/";

export const getStats = async (problem: Problem) => {
    const url = new URL(backUrl);
    url.searchParams.append("puzzleId", problem.puzzleId);
    url.searchParams.append("seed", problem.seed);
    url.searchParams.append("substanceMaxCount", problem.substanceMaxCount.toString());
    url.searchParams.append("substanceCount", problem.substanceCount.toString());
    url.searchParams.append("ingredientCount", problem.ingredientCount.toString());
    for (const target of problem.targets) {
        url.searchParams.append("targets", target);
    }
    const res = await fetch(url);
    const data = await res.json();
    return data as StatsData;
}

export const postSolution = async (solution: Solution) => {
    const res = await fetch(backUrl, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(solution),
    });
    return (await res.json()) as {
        isNotOriginal: Record<StatsKey, true>,
        data: StatsData,
    }
}

