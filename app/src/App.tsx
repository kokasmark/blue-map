import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import type { Achievement } from './types';
import { Node } from './components/Node';
import { loadSecrets } from './parse';
import ElkConstructor, { type ElkNode } from 'elkjs';
import { Graph, type GraphHandle } from './components/Graph';
import { getAncestors } from './utils';

function sectionToPath(section: any) {
  const { startPoint, endPoint, bendPoints = [] } = section
  const points = [startPoint, ...bendPoints, endPoint]
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
}

const EdgePath = React.memo(({ edge, achievementMap, unlocked, hoveredEdge, setHoveredEdge, transform, mousePos, setMousePos, layout, graphRef }: {
  edge: any,
  achievementMap: Record<number, Achievement>,
  unlocked: number[] | undefined,
  hoveredEdge: string | null,
  setHoveredEdge: (id: string | null) => void,
  transform: { x: number, y: number, scale: number },
  mousePos: { x: number, y: number },
  setMousePos: (pos: { x: number, y: number }) => void,
  layout: ElkNode,
  graphRef: React.RefObject<GraphHandle>
}) => {
  return (
    <>
      {edge.sections?.map((section: any, i: number) => {
        const targetId = parseInt(edge.id.split('-')[1])
        const targetAch = achievementMap[targetId]
        const isUnlocked = !!unlocked && unlocked[targetId - 1] === 1
        const isUnlockable = !isUnlocked && !!unlocked && (
          targetAch?.parents?.length === 0 ||
          targetAch?.parents?.every((id: number) => unlocked[id - 1] === 1)
        )
        const baseColor = isUnlocked ? "#86efac" : isUnlockable ? "#fef08a" : "#444"
        const color = hoveredEdge
          ? hoveredEdge === edge.id ? "white" : "#444"
          : baseColor

        return (
          <g key={`${edge.id}-${i}`}>
            <path
              d={sectionToPath(section)}
              fill="none"
              stroke="transparent"
              strokeWidth={12}
              onMouseEnter={() => setHoveredEdge(edge.id)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.closest('svg')!.getBoundingClientRect()
                setMousePos({
                  x: (e.clientX - rect.left) / transform.scale,
                  y: (e.clientY - rect.top) / transform.scale,
                })
              }}
              style={{ cursor: 'pointer' }}
            />
            <path
              d={sectionToPath(section)}
              fill="none"
              stroke={color}
              strokeWidth={2}
              markerEnd={isUnlocked ? "url(#arrow-unlocked)" : "url(#arrow-locked)"}
            />
            {hoveredEdge === edge.id && targetAch && (() => {
              const chains = getAncestors(achievementMap, targetAch);
              return (
                <foreignObject
                  x={mousePos.x}
                  y={mousePos.y}
                  width={500}
                  height={60}
                  style={{ overflow: 'visible', pointerEvents: 'all', zIndex: 200 }}
                  onMouseLeave={() => setHoveredEdge(null)}
                >
                  <div
                    className="flex flex-col w-fit gap-3 px-4 py-3 bg-[#0f0f0f]/90 rounded-lg backdrop-blur-sm border border-white/10"
                    style={{ transform: `scale(${1.0 + (1.0 - transform.scale)})`, color, borderColor: color }}
                  >
                    <p className='text-xs font-semibold tracking-wide text-white'>{targetAch.name}</p>
                    <p className='text-[11px] text-white/40 leading-relaxed'>{targetAch.unlock}</p>
                    {chains.length > 0 && (
                      <div className="flex flex-col gap-1.5 pt-1 border-t border-white/10">
                        {chains.map((chain, i) => (
                          <div key={i} className="flex items-center gap-1">
                            {chain.map((ach, j) => (
                              <React.Fragment key={ach.id}>
                                <img
                                  onClick={() => {
                                    const node = layout.children?.find(n => n.id === String(ach.id));
                                    if (!node) return;
                                    graphRef.current?.focusPoint(
                                      node.x! + node.width! / 2,
                                      node.y! + node.height! / 2
                                    );
                                    setHoveredEdge(null)
                                  }}
                                  src={ach.image}
                                  alt={ach.name}
                                  className="w-7 h-7 cursor-pointer opacity-70 hover:opacity-100 transition-opacity rounded-sm"
                                  title={ach.name}
                                />
                                {j < chain.length - 1 && <span className="text-white/20 text-xs">→</span>}
                              </React.Fragment>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </foreignObject>
              );
            })()}
          </g>
        )
      })}
    </>
  )
})

const AchievementNode = React.memo(({ node, achievement, unlocked }: {
  node: ElkNode,
  achievement: Achievement,
  unlocked: number[] | undefined
}) => (
  <div style={{ position: 'absolute', left: node.x, top: node.y }}>
    <Node achievement={achievement} unlocked={unlocked} />
  </div>
))

function App() {
  const elk = useMemo(() => new ElkConstructor(), [])
  const [achievements, setAchievements] = useState<Achievement[]>()
  const [unlocked, setUnlocked] = useState<number[]>()
  const [layout, setLayout] = useState<ElkNode | null>(null)
  const [achievementMap, setAchievementMap] = useState<Record<number, Achievement>>({})
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const graphRef = useRef<GraphHandle>(null)
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const load = useCallback(async () => {
    const response = await fetch("/achievements.json")
    const data: Achievement[] = await response.json()
    setAchievements(data)
    setAchievementMap(Object.fromEntries(data.map(a => [a.id, a])))
  }, [])

  const parse = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const fromSave = await loadSecrets(files[0])
    setUnlocked(fromSave)
  }, [])

  const buildLayout = useCallback(async (data: Achievement[]) => {
    const seen = new Set<string>()
    const children = data
      .filter(a => { const k = String(a.id); return seen.has(k) ? false : (seen.add(k), true) })
      .map(a => ({
        id: String(a.id),
        width: 200,
        height: 36,
        layoutOptions: { 'elk.padding': '[top=20, bottom=20, left=0, right=0]' }
      }))

    const edgeSeen = new Set<string>()
    const edges = data.flatMap(a =>
      (a.parents ?? []).map(parentId => ({
        id: `${parentId}-${a.id}`,
        sources: [String(parentId)],
        targets: [String(a.id)],
      }))
    ).filter(e => edgeSeen.has(e.id) ? false : (edgeSeen.add(e.id), true))

    const result = await elk.layout({
      id: "root",
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
    setLayout(result)
  }, [elk])

  const handleTransformChange = useCallback((t: typeof transform) => setTransform(t), [])
  const handleSetHoveredEdge = useCallback((id: string | null) => setHoveredEdge(id), [])
  const handleSetMousePos = useCallback((pos: { x: number, y: number }) => setMousePos(pos), [])
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => parse(e.target.files), [parse])

  const renderedEdges = useMemo(() => layout?.edges?.map(edge => (
    <EdgePath
      key={edge.id}
      edge={edge}
      achievementMap={achievementMap}
      unlocked={unlocked}
      hoveredEdge={hoveredEdge}
      setHoveredEdge={handleSetHoveredEdge}
      transform={transform}
      mousePos={mousePos}
      setMousePos={handleSetMousePos}
      layout={layout}
      graphRef={graphRef}
    />
  )), [layout, achievementMap, unlocked, hoveredEdge, transform, mousePos, handleSetHoveredEdge, handleSetMousePos])

  const renderedNodes = useMemo(() => layout?.children?.map(node => {
    const achievement = achievementMap[Number(node.id)]
    if (!achievement) return null
    return (
      <AchievementNode
        key={node.id}
        node={node}
        achievement={achievement}
        unlocked={unlocked}
      />
    )
  }), [layout, achievementMap, unlocked])

  useEffect(() => { load() }, [load])
  useEffect(() => { if (achievements) buildLayout(achievements) }, [achievements, buildLayout])

  return (
    <div className='overflow-hidden user-select-none'>
      <div className="fixed top-0 left-0 right-0 w-full z-50 flex justify-between items-center px-8 py-3 bg-[#0f0f0f]/90 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src="https://static.wikia.nocookie.net/bindingofisaacre_gamepedia/images/6/6b/Collectible_Blue_Map_icon.png"
            width={36}
            height={36}
            decoding='async'
            className="opacity-90"
          />
          <div className="flex items-baseline gap-2">
            <p className="text-base font-semibold tracking-wide text-white">Blue Map</p>
            <p className="text-xs text-white/30">TBOI Progress Map</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!unlocked ? (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-white/50 hover:text-white/80 transition-colors">
              <span>Load save</span>
              <input className="hidden" type="file" onChange={handleFileChange} />
              <span className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 transition-all">
                Browse
              </span>
            </label>
          ) : (
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white/70">{unlocked.filter(x => x === 1).length}</span>
              <span>/ {unlocked.length}</span>
            </div>
          )}
        </div>
      </div>

      {!layout && <p className='text-white/70 absolute top-20 left-10 text-xs'>Map loading... This could take a few seconds...</p>}

      {layout && (
        <Graph ref={graphRef} layout={layout} onTransformChange={handleTransformChange}>
          <div style={{ position: 'relative', width: layout.width, height: layout.height }}>
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <defs>
                <marker id="arrow-unlocked" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="white" />
                </marker>
                <marker id="arrow-locked" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#444" />
                </marker>
              </defs>
              {renderedEdges}
            </svg>
            {renderedNodes}
          </div>
        </Graph>
      )}
    </div>
  )
}

export default App