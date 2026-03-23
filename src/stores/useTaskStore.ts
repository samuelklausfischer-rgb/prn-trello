import React, { createContext, useContext, useState } from 'react'
import useAuthStore from './useAuthStore'
import { toast } from '@/components/ui/use-toast'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type HistoryAction =
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'DELEGATED'
  | 'DUE_DATE_CHANGED'
  | 'CHECKLIST_ADDED'
  | 'CHECKLIST_COMPLETED'
  | 'CHECKLIST_UNCOMPLETED'
  | 'TASK_ARCHIVED'

export type ChecklistItem = {
  id: string
  title: string
  completed: boolean
  completedAt?: string
  completedBy?: string
  createdAt?: string
}

export type TaskHistory = {
  id: string
  action: HistoryAction
  description: string
  oldValue?: string
  newValue?: string
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
  delegator: string | null
  assignee: { name: string; avatar: string } | null
  checklists: ChecklistItem[]
  history: TaskHistory[]
  createdAt: string
}

type TaskContextType = {
  tasks: Task[]
  updateTaskStatus: (taskId: string, status: TaskStatus) => void
  toggleChecklist: (taskId: string, checklistId: string) => void
  updateTaskDescription: (taskId: string, description: string) => void
  addChecklistItem: (taskId: string, title: string) => void
}

const TaskContext = createContext<TaskContextType | null>(null)

const A_JS = {
  name: 'João Silva',
  avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
}
const A_MO = {
  name: 'Maria Oliveira',
  avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=2',
}
const A_CS = {
  name: 'Carlos Souza',
  avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3',
}
const A_AC = {
  name: 'Ana Costa',
  avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=4',
}

const now = Date.now()
const day = 86400000

const createHistory = (
  by: string,
  action: HistoryAction,
  desc: string,
  offset: number,
): TaskHistory => ({
  id: Math.random().toString(),
  action,
  description: desc,
  performedBy: by,
  performedAt: new Date(now - offset).toISOString(),
})

const generateChecklists = (count: number, completedCount: number): ChecklistItem[] => {
  return Array.from({ length: count }).map((_, i) => {
    const isCompleted = i < completedCount
    return {
      id: `chk_${Math.random().toString(36).substr(2, 9)}`,
      title: `Item de verificação essencial ${i + 1}`,
      completed: isCompleted,
      createdAt: new Date(now - day * 2).toISOString(),
      ...(isCompleted && {
        completedAt: new Date(now - day).toISOString(),
        completedBy: 'Sistema',
      }),
    }
  })
}

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Revisão do Balanço Trimestral',
    description: 'Analisar as planilhas financeiras do Q3 e aprovar os repasses necessários.',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: new Date(now + day).toISOString(),
    delegator: 'Admin Geral',
    assignee: A_MO,
    checklists: generateChecklists(4, 1),
    history: [createHistory('Admin Geral', 'TASK_CREATED', 'Tarefa criada no sistema', day)],
    createdAt: new Date(now - day).toISOString(),
  },
  {
    id: 't2',
    title: 'Atualização de Políticas de Segurança',
    description: 'Revisar e publicar novas regras de acesso aos servidores AWS.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    dueDate: new Date(now - day).toISOString(),
    delegator: 'Admin Geral',
    assignee: A_CS,
    checklists: generateChecklists(5, 2),
    history: [createHistory('Admin Geral', 'TASK_CREATED', 'Tarefa criada', day * 2)],
    createdAt: new Date(now - day * 2).toISOString(),
  },
  {
    id: 't3',
    title: 'Apresentação Comercial',
    description: 'Montar os slides para a reunião com os diretores.',
    status: 'REVIEW',
    priority: 'MEDIUM',
    dueDate: new Date(now).toISOString(),
    delegator: 'Mariana Rios',
    assignee: A_AC,
    checklists: generateChecklists(3, 3),
    history: [createHistory('Mariana Rios', 'TASK_CREATED', 'Tarefa criada', day)],
    createdAt: new Date(now - day).toISOString(),
  },
  {
    id: 't4',
    title: 'Onboarding de Novos Funcionários',
    description: 'Preparar kits de boas-vindas.',
    status: 'DONE',
    priority: 'LOW',
    dueDate: new Date(now - day * 7).toISOString(),
    delegator: 'Pedro Souza',
    assignee: A_JS,
    checklists: generateChecklists(4, 4),
    history: [createHistory('Pedro Souza', 'TASK_CREATED', 'Tarefa criada', day * 8)],
    createdAt: new Date(now - day * 8).toISOString(),
  },
  {
    id: 't5',
    title: 'Preparar Relatório de Vendas',
    description: 'Compilar dados de vendas do mês atual.',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: new Date(now + day * 3).toISOString(),
    delegator: 'Pedro Souza',
    assignee: A_MO,
    checklists: generateChecklists(3, 0),
    history: [createHistory('Pedro Souza', 'TASK_CREATED', 'Tarefa criada', day)],
    createdAt: new Date(now - day).toISOString(),
  },
  {
    id: 't6',
    title: 'Fechar folha de pagamento',
    description: 'Conferir horas extras e benefícios.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: new Date(now).toISOString(),
    delegator: 'Admin Geral',
    assignee: A_JS,
    checklists: generateChecklists(5, 3),
    history: [createHistory('Admin Geral', 'TASK_CREATED', 'Tarefa criada', day * 2)],
    createdAt: new Date(now - day * 2).toISOString(),
  },
  {
    id: 't7',
    title: 'Aprovar layout do novo site',
    description: 'Revisar telas do Figma com a agência.',
    status: 'TODO',
    priority: 'LOW',
    dueDate: new Date(now + day * 7).toISOString(),
    delegator: 'Mariana Rios',
    assignee: A_CS,
    checklists: generateChecklists(3, 0),
    history: [createHistory('Mariana Rios', 'TASK_CREATED', 'Tarefa criada', day)],
    createdAt: new Date(now - day).toISOString(),
  },
]

const statusMap = {
  TODO: 'A Fazer',
  IN_PROGRESS: 'Em Progresso',
  REVIEW: 'Em Revisão',
  DONE: 'Concluído',
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const { user, addPoints } = useAuthStore()

  const performerName = user?.name || 'Sistema'

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.status !== status) {
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
            description: `Status alterado de ${statusMap[t.status]} para ${statusMap[status]}`,
            oldValue: statusMap[t.status],
            newValue: statusMap[status],
            performedBy: performerName,
            performedAt: new Date().toISOString(),
          }

          return { ...t, status, history: [historyAction, ...t.history] }
        }
        return t
      }),
    )
  }

  const toggleChecklist = (taskId: string, checklistId: string) => {
    setTasks((prev) => {
      return prev.map((t) => {
        if (t.id === taskId) {
          let toggledItemName = ''
          let isNowCompleted = false

          const checklists = t.checklists.map((c) => {
            if (c.id === checklistId) {
              toggledItemName = c.title
              isNowCompleted = !c.completed
              return {
                ...c,
                completed: isNowCompleted,
                completedAt: isNowCompleted ? new Date().toISOString() : undefined,
                completedBy: isNowCompleted ? performerName : undefined,
              }
            }
            return c
          })

          const historyAction: TaskHistory = {
            id: Math.random().toString(),
            action: isNowCompleted ? 'CHECKLIST_COMPLETED' : 'CHECKLIST_UNCOMPLETED',
            description: `Item "${toggledItemName}" ${isNowCompleted ? 'marcado como concluído' : 'desmarcado'}`,
            performedBy: performerName,
            performedAt: new Date().toISOString(),
          }

          // Check for 100% completion
          const total = checklists.length
          const completedCount = checklists.filter((c) => c.completed).length

          if (isNowCompleted) {
            if (completedCount === total) {
              toast({
                title: 'Checklist Finalizado! 🎉',
                description: 'Todos os itens desta tarefa foram concluídos.',
                variant: 'default',
                className: 'bg-green-600 text-white border-green-700',
              })
            } else {
              toast({
                title: 'Item concluído',
                description: `Progresso: ${completedCount}/${total}`,
              })
            }
          }

          return { ...t, checklists, history: [historyAction, ...t.history] }
        }
        return t
      })
    })
  }

  const addChecklistItem = (taskId: string, title: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newItem: ChecklistItem = {
            id: `chk_${Math.random().toString(36).substr(2, 9)}`,
            title,
            completed: false,
            createdAt: new Date().toISOString(),
          }

          const historyAction: TaskHistory = {
            id: Math.random().toString(),
            action: 'CHECKLIST_ADDED',
            description: `Novo item adicionado: "${title}"`,
            performedBy: performerName,
            performedAt: new Date().toISOString(),
          }

          return {
            ...t,
            checklists: [...t.checklists, newItem],
            history: [historyAction, ...t.history],
          }
        }
        return t
      }),
    )
  }

  const updateTaskDescription = (taskId: string, description: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.description !== description) {
          const historyAction: TaskHistory = {
            id: Math.random().toString(),
            action: 'TASK_UPDATED',
            description: 'Descrição da tarefa atualizada',
            oldValue: t.description,
            newValue: description,
            performedBy: performerName,
            performedAt: new Date().toISOString(),
          }
          return { ...t, description, history: [historyAction, ...t.history] }
        }
        return t
      }),
    )
  }

  return React.createElement(
    TaskContext.Provider,
    {
      value: { tasks, updateTaskStatus, toggleChecklist, updateTaskDescription, addChecklistItem },
    },
    children,
  )
}

export default function useTaskStore() {
  const context = useContext(TaskContext)
  if (!context) throw new Error('useTaskStore must be used within TaskProvider')
  return context
}
