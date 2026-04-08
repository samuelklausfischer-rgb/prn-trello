import React, { createContext, useContext, useState, useCallback } from 'react'

type TourContextType = {
  isOpen: boolean
  startTour: () => void
  closeTour: () => void
}

const TourContext = createContext<TourContextType | null>(null)

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const startTour = useCallback(() => setIsOpen(true), [])
  const closeTour = useCallback(() => setIsOpen(false), [])

  return React.createElement(
    TourContext.Provider,
    { value: { isOpen, startTour, closeTour } },
    children,
  )
}

export default function useTourStore() {
  const context = useContext(TourContext)
  if (!context) throw new Error('useTourStore must be used within TourProvider')
  return context
}
