import React, { useMemo } from "react"
import { Node } from "./Node"
import { Graph } from "./Graph"
import { SvgDefs } from "./SvgDefs"
import { Edge } from "./Edge"
import { useLayout, useStore } from "../store"

export const Canvas = React .memo(() => {
  const layout = useLayout()
  const graphRef = useStore((s) => s.graphRef)

  const edges = useMemo(
    () => layout?.edges?.map((edge) => <Edge key={edge.id} edge={edge as any} />) ?? [],
    [layout?.edges],
  )

  const nodes = useMemo(
    () =>
      layout?.children?.map((node) => <Node key={node.id} node={node} />) ?? [],
    [layout?.children],
  )

  if (!layout) return null

  return (
    <Graph ref={graphRef} layout={layout}>
      <div style={{ position: 'relative', width: layout.width, height: layout.height }}>
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          onClick={(e) => {
            if ((e.target as SVGElement).tagName === 'svg') {
              useStore.getState().setHoveredEdge(null)
            }
          }}
        >
          <SvgDefs />
          {edges}
        </svg>
        {nodes}
      </div>
    </Graph>
  )
})
