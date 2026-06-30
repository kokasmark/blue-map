import React from 'react'
import type { ElkEdge } from 'elkjs'
import { useStore, useEdgeUIState, useAchievementMap, useLayout } from '../store'
import { getAncestors } from '../utils'

function sectionToPath(section: any): string {
    const { startPoint, endPoint, bendPoints = [] } = section
    const points = [startPoint, ...bendPoints, endPoint]
    return points.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
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
            width={500}
            height={60}
            style={{ overflow: 'visible', pointerEvents: 'all', zIndex: 200 }}
        >
            <div
                className="flex flex-col w-fit gap-2.5 px-4 py-3 rounded-md bg-black border"
                style={{
                    background: 'rgba(10,10,12,0.92)',
                    borderColor: color,
                    boxShadow: `0 0 20px ${color}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
                }}
            >
                <p className="text-xs font-semibold tracking-wide" style={{ color }}>{targetAch.name}</p>
                <p className="text-[11px] text-white/40 leading-relaxed max-w-[280px]">{targetAch.unlock}</p>

                {chains.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                        {chains.map((chain, i) => (
                            <div key={i} className="flex items-center gap-1.5">
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
                                            className="w-6 h-6 cursor-pointer opacity-50 hover:opacity-100 transition-opacity rounded"
                                            title={ach.name}
                                        />
                                        {j < chain.length - 1 && (
                                            <span className="text-white/20 text-[10px]">→</span>
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
    const arrowId = isUnlocked ? 'url(#arrow-unlocked)' : 'url(#arrow-locked)'

    return (
        <>
            {edge.sections?.map((section: any, i: number) => (
                <g key={`${edge.id}-${i}`}>
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

            {isHovered && <EdgeTooltip edgeId={edge.id} color={color} />}
        </>
    )
})