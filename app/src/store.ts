import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { ElkNode } from 'elkjs'
import type { IAchievement, Achievement } from './types'
import type { GraphHandle } from './components/Graph'
import React from 'react'

export interface AchievementStore {
    achievements: IAchievement[]
    unlocked: number[] | undefined

    achievementMap: Record<number, Achievement>

    layout: ElkNode | null

    transform: { x: number; y: number; scale: number }
    hoveredEdge: string | null
    mousePos: { x: number; y: number }

    graphRef: React.RefObject<GraphHandle>

    setAchievements: (achievements: IAchievement[]) => void
    setUnlocked: (unlocked: number[]) => void
    setLayout: (layout: ElkNode) => void
    setTransform: (transform: { x: number; y: number; scale: number }) => void
    setHoveredEdge: (id: string | null) => void
    setMousePos: (pos: { x: number; y: number }) => void

    queryAchievements: (filter: (a: Achievement) => boolean) => Achievement[]
}

function updateMap(
    achievements: IAchievement[],
    unlocked: number[] | undefined,
): Record<number, Achievement> {
    const map: Record<number, Achievement> = {}

    for (const a of achievements) {
        const isUnlocked = !!unlocked && unlocked[a.id - 1] === 1 || a.essential

        map[a.id] = { ...a, isUnlocked, isUnlockable: false }
    }

    for (const a of achievements) {
        const mapped = map[a.id]
        const isUnlockable =
            !mapped.isUnlocked &&
            !!unlocked &&
            (a.parents?.length === 0 || a.parents?.every((id) => map[id].isUnlocked))

        map[a.id] = { ...mapped, isUnlockable }
    }

    return map
}

export const useStore = create<AchievementStore>((set, get) => ({
    achievements: [],
    unlocked: undefined,
    achievementMap: {},
    layout: null,
    transform: { x: 0, y: 0, scale: 0.03 },
    hoveredEdge: null,
    mousePos: { x: 0, y: 0 },
    // @ts-ignore
    graphRef: React.createRef<GraphHandle>(),

    setAchievements: (achievements) => {
        const { unlocked } = get()
        const achievementMap = updateMap(achievements, unlocked)
        set({ achievements, achievementMap })
    },

    setUnlocked: (unlocked) => {
        const { achievements } = get()
        const achievementMap = updateMap(achievements, unlocked)
        set({ unlocked, achievementMap })
    },

    setLayout: (layout) => set({ layout }),
    setTransform: (transform) => set({ transform }),
    setHoveredEdge: (hoveredEdge) => set({ hoveredEdge }),
    setMousePos: (mousePos) => set({ mousePos }),

    queryAchievements: (filter) => Object.values(get().achievementMap).filter(filter),
}))

export const useAchievementMap = () =>
    useStore((s) => s.achievementMap)

export const useLayout = () =>
    useStore((s) => s.layout)

export const useTransform = () =>
    useStore(useShallow((s) => s.transform))

export const useEdgeUIState = () =>
    useStore(
        useShallow((s) => ({
            hoveredEdge: s.hoveredEdge,
            mousePos: s.mousePos,
            transform: s.transform,
            setHoveredEdge: s.setHoveredEdge,
            setMousePos: s.setMousePos,
        })),
    )