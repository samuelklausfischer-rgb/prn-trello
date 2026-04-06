import { useState, useRef, useCallback } from 'react'

export interface PointerDragState {
  taskId: string
  isDragging: boolean
  initialPos: { x: number; y: number }
  currentPos: { x: number; y: number }
  elementPos: { x: number; y: number; width: number; height: number }
  hoveredColumn: string | null
  dropIndex: number | null
}

export function usePointerDnD({
  onDrop,
}: {
  onDrop: (taskId: string, colId: string, dropIndex: number) => void
}) {
  const [dragState, setDragState] = useState<PointerDragState | null>(null)
  const stateRef = useRef<PointerDragState | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const targetRef = useRef<HTMLElement | null>(null)
  const scrollRafRef = useRef<number | null>(null)

  const startDrag = useCallback((taskId: string, x: number, y: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    const newState: PointerDragState = {
      taskId,
      isDragging: true,
      initialPos: { x, y },
      currentPos: { x, y },
      elementPos: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
      hoveredColumn: null,
      dropIndex: null,
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

      timerRef.current = setTimeout(
        () => {
          startDrag(taskId, startX, startY, el)
        },
        e.pointerType === 'mouse' ? 150 : 300,
      )

      let lastClientX = startX
      let lastClientY = startY

      const autoScroll = () => {
        if (!stateRef.current?.isDragging) return

        const SCROLL_SPEED = 12
        const EDGE_THRESHOLD = 80

        let scrolled = false

        // Vertical window scroll
        if (lastClientY < EDGE_THRESHOLD) {
          window.scrollBy(0, -SCROLL_SPEED)
          scrolled = true
        } else if (window.innerHeight - lastClientY < EDGE_THRESHOLD) {
          window.scrollBy(0, SCROLL_SPEED)
          scrolled = true
        }

        // Container scroll
        const scrollContainers = document.querySelectorAll('.overflow-x-auto, .overflow-y-auto')
        scrollContainers.forEach((container) => {
          const rect = container.getBoundingClientRect()
          if (
            lastClientY >= rect.top &&
            lastClientY <= rect.bottom &&
            lastClientX >= rect.left &&
            lastClientX <= rect.right
          ) {
            // Horizontal
            if (
              container.classList.contains('overflow-x-auto') ||
              container.classList.contains('custom-scrollbar')
            ) {
              if (lastClientX - rect.left < EDGE_THRESHOLD) {
                container.scrollBy(-SCROLL_SPEED, 0)
                scrolled = true
              } else if (rect.right - lastClientX < EDGE_THRESHOLD) {
                container.scrollBy(SCROLL_SPEED, 0)
                scrolled = true
              }
            }
            // Vertical
            if (
              container.classList.contains('overflow-y-auto') ||
              container.classList.contains('custom-scrollbar')
            ) {
              if (lastClientY - rect.top < EDGE_THRESHOLD) {
                container.scrollBy(0, -SCROLL_SPEED)
                scrolled = true
              } else if (rect.bottom - lastClientY < EDGE_THRESHOLD) {
                container.scrollBy(0, SCROLL_SPEED)
                scrolled = true
              }
            }
          }
        })

        if (scrolled) {
          handleDragMove(lastClientX, lastClientY)
        }

        scrollRafRef.current = requestAnimationFrame(autoScroll)
      }

      const handleDragMove = (clientX: number, clientY: number) => {
        const target = document.elementFromPoint(clientX, clientY)
        const colElement = target?.closest('[data-column]')
        const hoveredColumn = colElement ? colElement.getAttribute('data-column') : null

        let dropIndex = 0
        if (colElement) {
          const taskElements = Array.from(colElement.querySelectorAll('[data-task-id]'))
          dropIndex = taskElements.length
          for (let i = 0; i < taskElements.length; i++) {
            const rect = taskElements[i].getBoundingClientRect()
            if (clientY < rect.top + rect.height / 2) {
              dropIndex = i
              break
            }
          }
        }

        const newState = {
          ...stateRef.current!,
          currentPos: { x: clientX, y: clientY },
          hoveredColumn,
          dropIndex,
        }

        setDragState(newState)
        stateRef.current = newState
      }

      const handleGlobalMove = (moveEvent: PointerEvent) => {
        lastClientX = moveEvent.clientX
        lastClientY = moveEvent.clientY

        if (!stateRef.current) {
          const dx = moveEvent.clientX - startX
          const dy = moveEvent.clientY - startY

          if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
            if (timerRef.current) clearTimeout(timerRef.current)
            cleanup()
          } else if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
            if (timerRef.current) clearTimeout(timerRef.current)
            startDrag(taskId, moveEvent.clientX, moveEvent.clientY, el)
            scrollRafRef.current = requestAnimationFrame(autoScroll)
          }
        } else {
          moveEvent.preventDefault()
          if (!scrollRafRef.current) {
            scrollRafRef.current = requestAnimationFrame(autoScroll)
          }
          handleDragMove(moveEvent.clientX, moveEvent.clientY)
        }
      }

      const handleGlobalUp = (upEvent: PointerEvent) => {
        if (timerRef.current) clearTimeout(timerRef.current)

        const st = stateRef.current
        if (st && st.isDragging) {
          if (st.hoveredColumn && st.dropIndex !== null) {
            onDrop(st.taskId, st.hoveredColumn, st.dropIndex)
          }
          document.body.style.overflow = ''
        }
        cleanup()
      }

      const cleanup = () => {
        document.removeEventListener('pointermove', handleGlobalMove)
        document.removeEventListener('pointerup', handleGlobalUp)
        document.removeEventListener('pointercancel', handleGlobalUp)
        if (scrollRafRef.current) {
          cancelAnimationFrame(scrollRafRef.current)
          scrollRafRef.current = null
        }
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
