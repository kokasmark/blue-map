import type { ElkNode } from "elkjs"
import { forwardRef, useEffect, useImperativeHandle, useRef, type ReactNode } from "react"
import { useStore } from "../store"

export interface GraphHandle {
  focusPoint: (x: number, y: number) => void
}

interface GraphProps {
  layout: ElkNode
  children: ReactNode
}

export const Graph = forwardRef<GraphHandle, GraphProps>(({ layout, children }, ref) => {
  const transform = useStore((s) => s.transform)
  const setTransform = useStore((s) => s.setTransform)
  const setHoveredEdge = useStore((s) => s.setHoveredEdge)

  const transformRef = useRef(transform)
  transformRef.current = transform

  useImperativeHandle(ref, () => ({
    focusPoint: (x, y) => {
      const t = transformRef.current
      const nodeSize = 64
      const padding = 200

      const targetScale = Math.min(
        (window.innerWidth - padding) / nodeSize,
        (window.innerHeight - padding) / nodeSize,
        1.0,
      )

      const screenX = x * targetScale + t.x
      const screenY = y * targetScale + t.y
      setTransform({
        x: t.x + (window.innerWidth / 2 - screenX),
        y: t.y + (window.innerHeight / 2 - screenY),
        scale: targetScale,
      })
    },
  }))

  const isDragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const t = transformRef.current
      setTransform({
        ...t,
        scale: Math.min(Math.max(t.scale - e.deltaY * 0.0001, 0.025), 3),
      })
    }
    el.addEventListener("wheel", handler, { passive: false })
    return () => el.removeEventListener("wheel", handler)
  }, [setTransform])

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    lastMouse.current = { x: e.clientX, y: e.clientY }
    const t = transformRef.current
    setTransform({ ...t, x: t.x + dx, y: t.y + dy })
  }

  const onMouseUp = () => { isDragging.current = false }

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100vh", cursor: "grab" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={() => setHoveredEdge(null)}
    >
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
          position: "relative",
          width: layout?.width,
          height: layout?.height,
        }}
      >
        {children}
      </div>
    </div>
  )
})