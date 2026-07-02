import { COMPLETION } from "./constants";
import type { CompletionTier, IAchievement } from "./types";

export function getAncestors(
  map: Record<number, IAchievement>,
  achievement: IAchievement
): IAchievement[][] {
  if (achievement.parents.length === 0)
    return [[achievement]]

  const realParents = achievement.parents.filter(
    id => !achievement.parents.some(otherId => otherId !== id && isAncestorOf(map, id, otherId))
  )

  const chains: IAchievement[][] = []
  for (const parentId of realParents) {
    const parent = map[parentId]
    if (!parent) continue
    for (const chain of getAncestors(map, parent)) {
      chains.push([...chain, achievement])
    }
  }
  return chains
}

function isAncestorOf(map: Record<number, IAchievement>, candidateId: number, ofId: number): boolean {
  const of = map[ofId]
  if (!of) return false
  if (of.parents.includes(candidateId)) return true
  return of.parents.some(p => isAncestorOf(map, candidateId, p))
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