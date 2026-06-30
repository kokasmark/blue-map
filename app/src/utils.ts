import { COMPLETION } from "./constants";
import type { CompletionTier, IAchievement } from "./types";

export function getAncestors(
    map: Record<number, IAchievement>,
    achievement: IAchievement
): IAchievement[][] {
    if (achievement.parents.length === 0)
        return [[achievement]];

    const chains: IAchievement[][] = [];

    for (const parentId of achievement.parents) {
        const parent = map[parentId];
        if (!parent) continue;

        for (const chain of getAncestors(map, parent)) {
            chains.push([...chain, achievement]);
        }
    }

    return chains;
}

export function getCompletion(unlocked: number[]) : {next: CompletionTier | null, current: CompletionTier | null, percent: number} {
  const current = COMPLETION.toReversed().find(
    (tier) => unlocked[tier.secret - 1] === 1
  ) ?? null

  const next = current
    ? COMPLETION[COMPLETION.indexOf(current) + 1] ?? null
    : COMPLETION[0]

  const percent = next
    ? (unlocked.filter((x,i) => x === 1 && i < next.secret).length / next.secret) * 100
    : 100

  return { current, next, percent }
}