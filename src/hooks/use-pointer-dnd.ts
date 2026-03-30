import { useState, useRef, useCallback } from 'react'

export interface PointerDragState {
  taskId: string
  isDragging: boolean
  initialPos: { x: number; y: number }
  currentPos: { x: number; y: number }
  elementPos: { x: number; y: number; width: number; height: number }
  hoveredColumn: string | null
}

export function usePointerDnD({ onDrop }: { onDrop: (taskId: string, colId: string) => void }) {
  const [dragState, setDragState] = useState<PointerDragState | null>(null)
  const stateRef = useRef<PointerDragState | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const targetRef = useRef<HTMLElement | null>(null)

  const startDrag = useCallback((taskId: string, x: number, y: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    const newState: PointerDragState = {
      taskId,
      isDragging: true,
      initialPos: { x, y },
      currentPos: { x, y },
      elementPos: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
      hoveredColumn: null,
    }
    setDragState(newState)
    stateRef.current = newState
    targetRef.current = el

    if (navigator.vibrate) navigator.vibrate(50)
    document.body.style.overflow = 'hidden'
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>, taskId: string) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return

      const el = e.currentTarget
      const startX = e.clientX
      const startY = e.clientY

      el.style.userSelect = 'none'
      el.classList.add('holding')

      // Set timeout to distinguish between tap/scroll and drag intent
      timerRef.current = setTimeout(
        () => {
          startDrag(taskId, startX, startY, el)
        },
        e.pointerType === 'mouse' ? 150 : 350,
      )

      const handleGlobalMove = (moveEvent: PointerEvent) => {
        if (!stateRef.current) {
          const dx = moveEvent.clientX - startX
          const dy = moveEvent.clientY - startY

          if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
            // Primarily vertical movement -> user intends to scroll, cancel drag timer
            if (timerRef.current) clearTimeout(timerRef.current)
            cleanup()
          } else if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
            // Primarily horizontal movement -> start drag immediately (cross-column intent)
            if (timerRef.current) clearTimeout(timerRef.current)
            startDrag(taskId, moveEvent.clientX, moveEvent.clientY, el)
          }
        } else {
          // Actively dragging
          moveEvent.preventDefault()

          // Locate the column underneath the cursor
          const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)
          const colElement = target?.closest('[data-column]')
          const hoveredColumn = colElement ? colElement.getAttribute('data-column') : null

          setDragState((prev) =>
            prev
              ? {
                  ...prev,
                  currentPos: { x: moveEvent.clientX, y: moveEvent.clientY },
                  hoveredColumn,
                }
              : null,
          )
          if (stateRef.current) {
            stateRef.current = {
              ...stateRef.current,
              currentPos: { x: moveEvent.clientX, y: moveEvent.clientY },
              hoveredColumn,
            }
          }
        }
      }

      const handleGlobalUp = (upEvent: PointerEvent) => {
        if (timerRef.current) clearTimeout(timerRef.current)

        const st = stateRef.current
        if (st && st.isDragging) {
          if (st.hoveredColumn) {
            onDrop(st.taskId, st.hoveredColumn)
          }
          document.body.style.overflow = ''
        }
        cleanup()
      }

      const cleanup = () => {
        document.removeEventListener('pointermove', handleGlobalMove)
        document.removeEventListener('pointerup', handleGlobalUp)
        document.removeEventListener('pointercancel', handleGlobalUp)
        setDragState(null)
        stateRef.current = null
        if (targetRef.current) {
          targetRef.current.style.userSelect = ''
        }
        el.classList.remove('holding')
      }

      document.addEventListener('pointermove', handleGlobalMove, { passive: false })
      document.addEventListener('pointerup', handleGlobalUp)
      document.addEventListener('pointercancel', handleGlobalUp)
    },
    [startDrag, onDrop],
  )

  return { handlePointerDown, dragState }
}
