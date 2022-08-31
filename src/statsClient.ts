import { CraftingAction } from './crafting';
import { levelPresets } from './levelPresets';


export type StatsData = {
    actionCount: Record<number, {
        all: number,
        unique: number,
    }>;
}

const useProdBackIndev = true;
const backUrl =
    (useProdBackIndev || !import.meta.env.DEV)
        ? "https://chems.x-pl.art/"
        : "http://127.0.0.1:8787/";

type LevelPreset = Omit<typeof levelPresets[0], "name">;

export const getStats = async (levelPreset: LevelPreset) => {
    const url = new URL(backUrl);
    url.searchParams.append("seed", levelPreset.seed);
    url.searchParams.append("substanceMaxCount", levelPreset.substanceMaxCount.toString());
    url.searchParams.append("substanceCount", levelPreset.substanceCount.toString());
    url.searchParams.append("ingredientCount", levelPreset.ingredientCount.toString());
    for (const target of levelPreset.targets) {
        url.searchParams.append("targets", target);
    }
    const res = await fetch(url);
    const data = await res.json();
    return data as StatsData;
}

export const postSolution = async (
    levelPreset: LevelPreset,
    solution: CraftingAction[]
) => {
    const res = await fetch(backUrl, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            levelPreset,
            solution,
        })
    });
    return (await res.json()) as {
        wasRegistered: boolean,
        data: StatsData,
    }
}

