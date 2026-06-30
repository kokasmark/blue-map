import React from 'react'
import type { ElkEdge } from 'elkjs'
import { useStore, useEdgeUIState, useAchievementMap, useLayout } from '../store'
import { getAncestors } from '../utils'
import { createPortal } from 'react-dom'

function sectionToPath(section: any): string {
    const { startPoint, endPoint, bendPoints = [] } = section
    const points = [startPoint, ...bendPoints, endPoint]
    return points.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
}

export function EdgeTooltipContainer() {
  const hoveredEdge = useStore((s) => s.hoveredEdge)
  const achievementMap = useAchievementMap()
  const transform = useStore((s) => s.transform)
  const mousePos = useStore((s) => s.mousePos)

  if (!hoveredEdge) return null

  const targetId = parseInt(hoveredEdge.split('-')[1])
  const targetAch = achievementMap[targetId]
  if (!targetAch) return null

  const isUnlocked = !!targetAch.isUnlocked
  const isUnlockable = !!targetAch.isUnlockable
  const color = isUnlocked ? '#86efac' : isUnlockable ? '#fef08a' : 'white'

  const screenX = mousePos.x * transform.scale + transform.x
  const screenY = mousePos.y * transform.scale + transform.y

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: screenX,
        top: screenY,
        zIndex: 9999,
        pointerEvents: 'all',
      }}
    >
      <EdgeTooltip edgeId={hoveredEdge} color={color} />
    </div>,
    document.body,
  )
}


export const EdgeTooltip = React.memo(({ edgeId, color }: { edgeId: string; color: string }) => {
  const achievementMap = useAchievementMap()
  const layout = useLayout()
  const graphRef = useStore((s) => s.graphRef)
  const mousePos = useStore((s) => s.mousePos)
  const transform = useStore((s) => s.transform)
  const setHoveredEdge = useStore((s) => s.setHoveredEdge)

  const targetId = parseInt(edgeId.split('-')[1])
  const targetAch = achievementMap[targetId]
  if (!targetAch || !layout) return null

  const chains = getAncestors(achievementMap, targetAch)

  return (
    <foreignObject
      x={mousePos.x}
      y={mousePos.y}
      width={320}
      height={400}
      style={{ overflow: 'visible', pointerEvents: 'all', zIndex: 200 }}
    >
      <div
        className="flex flex-col gap-2.5 px-4 py-3 rounded-md border"
        style={{
          margin: 8,
          width: 320,
          minHeight: 100,
          transformOrigin: 'top left',
          background: 'rgba(10,10,12,0.92)',
          borderColor: color,
          boxShadow: `0 0 20px ${color}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        <p className="text-xs font-semibold tracking-wide truncate" style={{ color }}>
          {targetAch.name} #{targetAch.id}
        </p>
        <p className="text-[11px] text-white/40 leading-relaxed line-clamp-3">
          {targetAch.unlock}
        </p>

        {chains.length > 0 && (
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
            {chains.map((chain, i) => (
              <div key={i} className="flex items-center gap-1.5 flex-wrap">
                {chain.map((ach, j) => (
                  <React.Fragment key={ach.id}>
                    <img
                      onClick={() => {
                        const node = layout.children?.find((n) => n.id === String(ach.id))
                        if (!node) return

                        graphRef.current?.focusPoint(
                          node.x! + node.width! / 2,
                          node.y! + node.height! / 2,
                        )
                        
                        setHoveredEdge(null)
                      }}
                      src={ach.image}
                      alt={ach.name}
                      className="w-6 h-6 cursor-pointer opacity-50 hover:opacity-100 transition-opacity rounded shrink-0"
                      title={ach.name}
                    />
                    {j < chain.length - 1 && (
                      <span className="text-white/20 text-md font-medium">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </foreignObject>
  )
})

interface EdgePathProps {
    edge: ElkEdge & { sections?: any[] }
}

export const Edge = React.memo(({ edge }: EdgePathProps) => {
    const { hoveredEdge, setHoveredEdge, setMousePos, transform } = useEdgeUIState()
    const achievementMap = useAchievementMap()

    const targetId = parseInt(edge.id.split('-')[1])
    const targetAch = achievementMap[targetId]

    const isUnlocked = !!targetAch?.isUnlocked
    const isUnlockable = !!targetAch?.isUnlockable

    const baseColor = isUnlocked ? '#86efac' : isUnlockable ? '#fef08a' : '#444'
    const color = hoveredEdge
        ? hoveredEdge === edge.id
            ? isUnlocked ? '#86efac' : isUnlockable ? '#fef08a' : 'white'
            : '#2a2a2a'
        : baseColor

    const isHovered = hoveredEdge === edge.id
    const arrowId = isUnlocked ? 'url(#arrow-unlocked)' : isUnlockable ? 'url(#arrow-unlockable)' : 'url(#arrow-locked)'

    return (
        <>
            {edge.sections?.map((section: any, i: number) => (
                <g key={`${edge.id}-${i}`} style={{filter: isUnlocked || isUnlockable ? `drop-shadow(0px 0px 10px ${color})` : ''}}>
                    <path
                        d={sectionToPath(section)}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={14}
                        onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.closest('svg')!.getBoundingClientRect()
                            setMousePos({
                                x: (e.clientX - rect.left) / transform.scale,
                                y: (e.clientY - rect.top) / transform.scale,
                            })
                            setHoveredEdge(edge.id)
                        }}
                        style={{ cursor: 'pointer' }}
                    />
                    {isHovered && (
                        <path
                            d={sectionToPath(section)}
                            fill="none"
                            stroke={color}
                            strokeWidth={6}
                            strokeOpacity={0.15}
                        />
                    )}

                    <path
                        d={sectionToPath(section)}
                        fill="none"
                        stroke={color}
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        markerEnd={arrowId}
                        style={{ transition: 'stroke 0.15s, stroke-width 0.1s' }}
                    />
                </g>
            ))}
        </>
    )
})