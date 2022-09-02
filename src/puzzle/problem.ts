export type Problem = {
    puzzleId: string; // e.g. "chemstack@5",
    seed: string;
    substanceMaxCount: number;
    substanceCount: number;
    ingredientCount: number;
    targets: string[];
};

// Cmp stands for "comparison string" here
// -- a string, safe to use for structural comparison
export const getProblemCmp = ({
    puzzleId, 
    seed,
    substanceMaxCount,
    substanceCount,
    ingredientCount,
    targets,
}: Problem) => JSON.stringify({
    // re-struct object to ensure order and drop extra entries
    puzzleId, 
    seed,
    substanceMaxCount,
    substanceCount,
    ingredientCount,
    targets,
});
