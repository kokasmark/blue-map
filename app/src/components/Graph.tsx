import type { ElkNode } from "elkjs"
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from "react"

export interface GraphHandle {
    focusPoint: (x: number, y: number) => void,
    getTransform: () => { x: number, y: number, scale: number }
}

export const Graph = forwardRef<GraphHandle, { layout: ElkNode, children: ReactNode, onTransformChange?: (transform: { x: number, y: number, scale: number }) => void }>(
    ({ layout, children, onTransformChange }, ref) => {
        const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
        
        useImperativeHandle(ref, () => ({
            focusPoint: (x, y) => {
                const screenX = x * transform.scale + transform.x
                const screenY = y * transform.scale + transform.y
                setTransform(t => ({
                    ...t,
                    x: t.x + (window.innerWidth / 2 - screenX),
                    y: t.y + (window.innerHeight / 2 - screenY),
                }))
            },
            getTransform: () => transform
        }))

        const updateTransform = (updater: (t: typeof transform) => typeof transform) => {
            setTransform(t => {
                const next = updater(t)
                onTransformChange?.(next)
                return next
            })
        }

        const isDragging = useRef(false)
        const lastMouse = useRef({ x: 0, y: 0 })
        const containerRef = useRef<HTMLDivElement>(null)

        const onWheel = (e: React.WheelEvent) => {
            e.preventDefault()
            updateTransform(t => ({
                ...t,
                scale: Math.min(Math.max(t.scale - e.deltaY * 0.0001, 0.025), 3)
            }))
        }

        const onMouseDown = (e: React.MouseEvent) => {
            isDragging.current = true
            lastMouse.current = { x: e.clientX, y: e.clientY }
        }

        const onMouseMove = (e: React.MouseEvent) => {
            if (!isDragging.current) return
            const dx = e.clientX - lastMouse.current.x
            const dy = e.clientY - lastMouse.current.y
            lastMouse.current = { x: e.clientX, y: e.clientY }
            updateTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }))
        }

        const onMouseUp = () => { isDragging.current = false }

        useEffect(() => {
            const el = containerRef.current
            if (!el) return
            const handler = (e: WheelEvent) => {
                e.preventDefault()
                updateTransform(t => ({
                    ...t,
                    scale: Math.min(Math.max(t.scale - e.deltaY * 0.0001, 0.025), 3)
                }))
            }
            el.addEventListener('wheel', handler, { passive: false })
            return () => el.removeEventListener('wheel', handler)
        }, [])

        return (
            < div
                style={{ width: '100%', height: '100vh', overflow: 'hidden', cursor: isDragging.current ? 'grabbing' : 'grab' }
                }
                onWheel={onWheel}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            >
                <div style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: '0 0',
                    position: 'relative',
                    width: layout?.width,
                    height: layout?.height,
                }}>
                    {children}
                </div>
            </div >
        )
    })
