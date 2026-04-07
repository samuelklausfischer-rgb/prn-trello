import { useState, useEffect, useCallback } from 'react'
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
}

export function GuideTour({ steps, open, onClose }: GuideTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  const updateRect = useCallback(() => {
    if (!open || !steps[currentStep]) return
    const target = document.querySelector(steps[currentStep].target)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => {
        const newRect = target.getBoundingClientRect()
        setTargetRect(newRect)
      }, 300)
      setTargetRect(target.getBoundingClientRect())
    } else {
      setTargetRect(null)
    }
  }, [open, currentStep, steps])

  useEffect(() => {
    if (open) {
      setCurrentStep(0)
      updateRect()
    }
  }, [open, updateRect])

  useEffect(() => {
    updateRect()
  }, [currentStep, updateRect, windowSize])

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', updateRect, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', updateRect)
    }
  }, [updateRect])

  if (!open) return null

  const step = steps[currentStep]

  let popoverStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }

  if (targetRect) {
    const spacing = 20
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
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-all duration-500"
        onClick={onClose}
      />

      {targetRect && (
        <div
          className="absolute transition-all duration-500 ease-in-out border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.6),0_0_30px_rgba(0,212,255,0.3)] rounded-xl pointer-events-none z-10"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        >
          <div className="absolute inset-0 animate-pulse opacity-20 bg-primary rounded-xl" />
        </div>
      )}

      <div
        className={cn(
          'absolute z-20 w-[320px] max-w-[calc(100vw-32px)] glass-card rounded-2xl shadow-2xl border border-primary/40 transition-all duration-500 ease-in-out',
          !targetRect && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        )}
        style={targetRect ? popoverStyle : undefined}
      >
        <div className="p-5 flex flex-col gap-3 relative overflow-hidden rounded-2xl bg-background/95">
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
              className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0 rounded-full hover:bg-white/10"
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
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
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
                    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
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
