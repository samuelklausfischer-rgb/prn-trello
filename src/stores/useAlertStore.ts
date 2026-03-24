import React, { createContext } from 'react'

export type AlertType =
  | 'TASK_DEADLINE'
  | 'PERFORMANCE'
  | 'ACHIEVEMENT'
  | 'SYSTEM'
  | 'CUSTOM'
  | 'DELEGATION'

export type Alert = {
  id: string
  title: string
  message: string
  type: AlertType
  targetUserId?: string
  createdBy: string
  createdAt: string
  readBy: string[]
}

type AlertContextType = {
  alerts: Alert[]
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'readBy'>) => void
  markAsRead: (alertId: string, userId: string) => void
}

const AlertContext = createContext<AlertContextType | null>(null)

export function AlertProvider({ children }: { children: React.ReactNode }) {
  // Deprecated mock store, replaced by PocketBase real-time notifications in the backend.
  // Kept here to avoid breaking existing providers wrappers that might import it.
  return React.createElement(
    AlertContext.Provider,
    { value: { alerts: [], addAlert: () => {}, markAsRead: () => {} } },
    children,
  )
}

export default function useAlertStore() {
  return { alerts: [], addAlert: () => {}, markAsRead: () => {} }
}
