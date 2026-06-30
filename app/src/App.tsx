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
  const children = achievements
    .filter((a) => {
      const k = String(a.id)
      return seen.has(k) ? false : (seen.add(k), true)
    })
    .map((a) => ({
      id: String(a.id),
      width: 64,
      height: 64,
      layoutOptions: { 'elk.padding': '[top=20, bottom=20, left=0, right=0]' },
    }))

  const edges = achievements.flatMap((a) =>
    (a.parents ?? []).map((parentId) => ({
      id: `${parentId}-${a.id}`,
      sources: [String(parentId)],
      targets: [String(a.id)],
    })),
  )

  return elk.layout({
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.layered.spacing.edgeEdgeBetweenLayers': '20',
      'elk.layered.spacing.edgeNodeBetweenLayers': '20',
      'elk.spacing.edgeEdge': '20',
      'elk.spacing.edgeNode': '20',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.layered.layering.strategy': 'LONGEST_PATH',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.edgeRouting': 'ORTHOGONAL',
    },
    children,
    edges,
  })
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
            <p className="text-xs text-white/30 tracking-widest uppercase">Building map…</p>
          </div>
        </div>
      )}

      <Canvas />
    </div>
  )
}

export default App