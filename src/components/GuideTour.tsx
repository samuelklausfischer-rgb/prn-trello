import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

export interface TourStep {
  target: string
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

interface GuideTourProps {
  steps: TourStep[]
  open: boolean
  onClose: () => void
  onStepChange?: (step: number) => void
}

export function GuideTour({ steps, open, onClose, onStepChange }: GuideTourProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (open) {
      setCurrentStep(0)
      onStepChange?.(0)
    }
  }, [open, onStepChange])
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const observerRef = useRef<ResizeObserver | null>(null)

  const updateRect = useCallback(() => {
    if (!open || !steps[currentStep]) return

    const target = document.querySelector(steps[currentStep].target)
    if (target) {
      const rect = target.getBoundingClientRect()
      setTargetRect(rect)
    } else {
      setTargetRect(null)
    }
  }, [open, currentStep, steps])

  useEffect(() => {
    if (!open || !steps[currentStep]) return

    let isMounted = true

    const tryFindTarget = (attempts = 0) => {
      if (!isMounted) return

      const target = document.querySelector(steps[currentStep].target)
      if (target) {
        setIsTransitioning(true)

        const isInDialog = target.closest('[role="dialog"]')
        if (!isInDialog) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }

        setTimeout(() => {
          if (isMounted) {
            updateRect()
            setIsTransitioning(false)
          }
        }, 400)

        updateRect()
      } else if (attempts < 20) {
        setTimeout(() => tryFindTarget(attempts + 1), 50)
      } else {
        setTargetRect(null)
      }
    }

    tryFindTarget()

    return () => {
      isMounted = false
    }
  }, [open, currentStep, steps, updateRect])

  useEffect(() => {
    if (!open) return

    const handleScrollOrResize = () => {
      if (!isTransitioning) {
        updateRect()
      }
    }

    window.addEventListener('resize', handleScrollOrResize)
    window.addEventListener('scroll', handleScrollOrResize, { passive: true })

    return () => {
      window.removeEventListener('resize', handleScrollOrResize)
      window.removeEventListener('scroll', handleScrollOrResize)
    }
  }, [open, isTransitioning, updateRect])

  useEffect(() => {
    if (!open || !steps[currentStep]) return

    const target = document.querySelector(steps[currentStep].target)
    if (!target) return

    observerRef.current = new ResizeObserver(() => {
      if (!isTransitioning) updateRect()
    })

    observerRef.current.observe(target)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [open, currentStep, steps, isTransitioning, updateRect])

  if (!open) return null

  const step = steps[currentStep]

  let popoverStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }

  if (targetRect) {
    const spacing = 24
    const placement = step.placement || 'bottom'

    if (placement === 'bottom') {
      popoverStyle = {
        top: targetRect.bottom + spacing,
        left: targetRect.left + targetRect.width / 2,
        transform: 'translateX(-50%)',
      }
    } else if (placement === 'top') {
      popoverStyle = {
        top: targetRect.top - spacing,
        left: targetRect.left + targetRect.width / 2,
        transform: 'translate(-50%, -100%)',
      }
    } else if (placement === 'left') {
      popoverStyle = {
        top: targetRect.top + targetRect.height / 2,
        left: targetRect.left - spacing,
        transform: 'translate(-100%, -50%)',
      }
    } else if (placement === 'right') {
      popoverStyle = {
        top: targetRect.top + targetRect.height / 2,
        left: targetRect.right + spacing,
        transform: 'translate(0, -50%)',
      }
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-auto">
      <div className="absolute inset-0 z-0 bg-transparent" onClick={onClose} />

      {targetRect ? (
        <div
          className="absolute transition-all duration-500 ease-in-out border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.4),0_0_30px_rgba(0,212,255,0.3)] rounded-xl pointer-events-none z-10"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        >
          <div className="absolute inset-0 animate-pulse opacity-20 bg-primary rounded-xl" />
        </div>
      ) : (
        <div className="absolute inset-0 z-10 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] pointer-events-none" />
      )}

      <div
        className={cn(
          'absolute z-20 w-[340px] max-w-[calc(100vw-32px)] bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary/40 transition-all duration-500 ease-in-out',
          !targetRect && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        )}
        style={targetRect ? popoverStyle : undefined}
      >
        <div className="p-5 flex flex-col gap-3 relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="flex items-start justify-between gap-4 mt-2">
            <h3 className="font-bold text-lg leading-tight text-foreground">{step.title}</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0 rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{step.content}</p>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <span className="text-xs font-semibold text-muted-foreground">
              Passo {currentStep + 1} de {steps.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = Math.max(0, currentStep - 1)
                  setCurrentStep(next)
                  onStepChange?.(next)
                }}
                disabled={currentStep === 0}
                className="h-8 px-2 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (currentStep === steps.length - 1) {
                    onClose()
                  } else {
                    const next = Math.min(steps.length - 1, currentStep + 1)
                    setCurrentStep(next)
                    onStepChange?.(next)
                  }
                }}
                className="h-8 px-4 rounded-lg"
              >
                {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
                {currentStep !== steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function useTour(tourId: string) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeen = localStorage.getItem(`tour_${tourId}`)
      if (!hasSeen) {
        setOpen(true)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [tourId])

  const closeTour = useCallback(() => {
    localStorage.setItem(`tour_${tourId}`, 'true')
    setOpen(false)
  }, [tourId])

  const startTour = useCallback(() => {
    setOpen(true)
  }, [])

  return { open, closeTour, startTour }
}
