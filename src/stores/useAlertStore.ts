import React, { createContext, useContext, useState } from 'react'

export type AlertType = 'TASK_DEADLINE' | 'PERFORMANCE' | 'ACHIEVEMENT' | 'SYSTEM' | 'CUSTOM'

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

const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    title: 'Boas-vindas ao PRN CRM',
    message:
      'Nossa nova plataforma está no ar! Fique de olho nas suas tarefas para pontuar no ranking.',
    type: 'SYSTEM',
    createdBy: 'u1',
    createdAt: new Date().toISOString(),
    readBy: [],
  },
  {
    id: 'a2',
    title: 'Aviso de Prazo: Balanço Trimestral',
    message: 'Não se esqueça que a tarefa expira em breve. Evite atrasos!',
    type: 'TASK_DEADLINE',
    createdBy: 'u1',
    targetUserId: 'u3',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    readBy: [],
  },
  {
    id: 'a3',
    title: 'Excelente Desempenho!',
    message: 'Você acaba de subir de nível no ranking global. Continue o ótimo trabalho!',
    type: 'ACHIEVEMENT',
    createdBy: 'Sistema',
    targetUserId: 'u2',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    readBy: [],
  },
]

const AlertContext = createContext<AlertContextType | null>(null)

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)

  const addAlert = (alertData: Omit<Alert, 'id' | 'createdAt' | 'readBy'>) => {
    setAlerts((prev) => [
      {
        ...alertData,
        id: `al_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        readBy: [],
      },
      ...prev,
    ])
  }

  const markAsRead = (alertId: string, userId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId && !a.readBy.includes(userId)
          ? { ...a, readBy: [...a.readBy, userId] }
          : a,
      ),
    )
  }

  return React.createElement(
    AlertContext.Provider,
    { value: { alerts, addAlert, markAsRead } },
    children,
  )
}

export default function useAlertStore() {
  const context = useContext(AlertContext)
  if (!context) throw new Error('useAlertStore must be used within AlertProvider')
  return context
}
