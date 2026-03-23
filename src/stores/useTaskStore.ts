import React, { createContext, useContext, useState } from 'react'
import useAuthStore from './useAuthStore'
import { toast } from '@/components/ui/use-toast'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type ChecklistItem = {
  id: string
  title: string
  completed: boolean
}

export type TaskHistory = {
  id: string
  action: string
  description: string
  performedBy: string
  performedAt: string
}

export type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  delegatedTo: string | null
  checklists: ChecklistItem[]
  history: TaskHistory[]
  createdAt: string
}

type TaskContextType = {
  tasks: Task[]
  updateTaskStatus: (taskId: string, status: TaskStatus) => void
  toggleChecklist: (taskId: string, checklistId: string) => void
}

const TaskContext = createContext<TaskContextType | null>(null)

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Revisão do Balanço Trimestral',
    description:
      'Analisar as planilhas financeiras do Q3 e aprovar os repasses necessários para o próximo período.',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    delegatedTo: 'Maria Oliveira',
    checklists: [
      { id: 'c1', title: 'Baixar relatórios do ERP', completed: true },
      { id: 'c2', title: 'Conferir valores de entrada', completed: false },
    ],
    history: [
      {
        id: 'h1',
        action: 'CREATED',
        description: 'Tarefa criada no sistema',
        performedBy: 'João Silva',
        performedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 't2',
    title: 'Atualização de Políticas de Segurança',
    description: 'Revisar os documentos de acesso aos sistemas internos.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    delegatedTo: 'Carlos Souza',
    checklists: [
      { id: 'c3', title: 'Reunião com TI', completed: true },
      { id: 'c4', title: 'Atualizar diretrizes', completed: false },
    ],
    history: [
      {
        id: 'h2',
        action: 'STATUS_CHANGED',
        description: 'Movido para Em Andamento',
        performedBy: 'Carlos Souza',
        performedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 186400000).toISOString(),
  },
  {
    id: 't3',
    title: 'Apresentação Comercial - Cliente Premium',
    description: 'Montar os slides para a reunião de sexta-feira com os diretores do Cliente X.',
    status: 'REVIEW',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 36400000).toISOString(),
    delegatedTo: 'Ana Costa',
    checklists: [],
    history: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 't4',
    title: 'Onboarding de Novos Funcionários',
    description: 'Preparar kits de boas-vindas e agendas da primeira semana.',
    status: 'DONE',
    priority: 'LOW',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    delegatedTo: 'Equipe RH',
    checklists: [
      { id: 'c5', title: 'Comprar materiais', completed: true },
      { id: 'c6', title: 'Configurar contas de e-mail', completed: true },
    ],
    history: [
      {
        id: 'h3',
        action: 'COMPLETED',
        description: 'Tarefa finalizada',
        performedBy: 'João Silva',
        performedAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 486400000).toISOString(),
  },
]

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const { user, addPoints } = useAuthStore()

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (status === 'DONE' && t.status !== 'DONE') {
            addPoints(50)
            toast({
              title: 'Tarefa concluída!',
              description: '+50 Pontos ganhos pelo excelente trabalho!',
              variant: 'default',
            })
          }

          const historyAction: TaskHistory = {
            id: Math.random().toString(),
            action: 'STATUS_CHANGED',
            description: `Status alterado de ${t.status} para ${status}`,
            performedBy: user?.name || 'Sistema',
            performedAt: new Date().toISOString(),
          }

          return { ...t, status, history: [historyAction, ...t.history] }
        }
        return t
      }),
    )
  }

  const toggleChecklist = (taskId: string, checklistId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const checklists = t.checklists.map((c) =>
            c.id === checklistId ? { ...c, completed: !c.completed } : c,
          )
          return { ...t, checklists }
        }
        return t
      }),
    )
  }

  return React.createElement(
    TaskContext.Provider,
    { value: { tasks, updateTaskStatus, toggleChecklist } },
    children,
  )
}

export default function useTaskStore() {
  const context = useContext(TaskContext)
  if (!context) throw new Error('useTaskStore must be used within TaskProvider')
  return context
}
