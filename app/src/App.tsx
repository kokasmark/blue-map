import { useEffect } from 'react'
import ElkConstructor from 'elkjs'
import type { IAchievement } from './types'
import {
  useStore,
  useLayout,
} from './store'
import { Header } from './components/Header'
import { Canvas } from './components/Canvas'

const elk = new ElkConstructor()

async function buildLayout(achievements: IAchievement[]) {
  const seen = new Set<string>()
  const deduped = achievements.filter((a) => {
    const k = String(a.id)
    return seen.has(k) ? false : (seen.add(k), true)
  })

  const isIsolated = (a: IAchievement) =>
    (a.parents?.length ?? 0) === 0 && (a.children?.length ?? 0) === 0

  const connected = deduped.filter((a) => !isIsolated(a))
  const isolated = deduped.filter(isIsolated)

  const children = connected.map((a) => ({
    id: String(a.id),
    width: 64,
    height: 64,
    layoutOptions: { 'elk.padding': '[top=20, bottom=20, left=0, right=0]' },
  }))

  const edges = connected.flatMap((a) =>
    (a.parents ?? [])
      .filter((parentId) => connected.some((c) => c.id === parentId))
      .map((parentId) => ({
        id: `${parentId}-${a.id}`,
        sources: [String(parentId)],
        targets: [String(a.id)],
      })),
  )

  const mainLayout = await elk.layout({
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.layered.spacing.edgeEdgeBetweenLayers': '20',
      'elk.layered.spacing.edgeNodeBetweenLayers': '20',
      'elk.spacing.edgeEdge': '20',
      'elk.spacing.edgeNode': '20',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.edgeRouting': 'ORTHOGONAL',
    },
    children,
    edges,
  })

  const cols = Math.ceil(Math.sqrt(isolated.length))
  const cellSize = 84
  const gridWidth = cols * cellSize

  const isolatedNodes = isolated.map((a, i) => ({
    id: String(a.id),
    width: 64,
    height: 64,
    x: (i % cols) * cellSize,
    y: Math.floor(i / cols) * cellSize,
  }))

  // @ts-ignore
  const mainHeight = mainLayout.height ?? 0
  const yOffset = mainHeight + 80

  const positionedIsolated = isolatedNodes.map((n) => ({
    ...n,
    y: n.y + yOffset,
  }))

  return {
    ...mainLayout,
    children: [...(mainLayout.children ?? []), ...positionedIsolated],
    height: yOffset + Math.ceil(isolated.length / cols) * cellSize,
    // @ts-ignore
    width: Math.max(mainLayout.width ?? 0, gridWidth),
  }
}

function App() {
  const setAchievements = useStore((s) => s.setAchievements)
  const setLayout = useStore((s) => s.setLayout)
  const achievements = useStore((s) => s.achievements)
  const layout = useLayout()

  useEffect(() => {
    fetch('/achievements.json')
      .then((r) => r.json())
      .then((data: IAchievement[]) => setAchievements(data))
  }, [setAchievements])

  useEffect(() => {
    if (achievements.length === 0) return
    buildLayout(achievements).then(setLayout)
  }, [achievements, setLayout])

  return (
    <div className="overflow-hidden select-none" style={{ background: '#08080a', minHeight: '100vh' }}>
      <Header />

      {!layout && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
            <p className="text-xs text-white/30 tracking-widest uppercase">Building tree...</p>
          </div>
        </div>
      )}

      <Canvas />
    </div>
  )
}

export default App