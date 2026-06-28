import type { Achievement } from "./types";

export function getAncestors(
    map: Record<number, Achievement>,
    achievement: Achievement
): Achievement[][] {
    if (achievement.parents.length === 0)
        return [[achievement]];

    const chains: Achievement[][] = [];

    for (const parentId of achievement.parents) {
        const parent = map[parentId];
        if (!parent) continue;

        for (const chain of getAncestors(map, parent)) {
            chains.push([...chain, achievement]);
        }
    }

    return chains;
}