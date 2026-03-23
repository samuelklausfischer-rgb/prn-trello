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

const createHistory = (by: string, desc: string, offset: number): TaskHistory => ({
  id: Math.random().toString(),
  action: 'CREATED',
  description: desc,
  performedBy: by,
  performedAt: new Date(now - offset).toISOString(),
})

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
    checklists: [
      { id: 'c1', title: 'Baixar relatórios', completed: true },
      { id: 'c2', title: 'Conferir valores', completed: false },
    ],
    history: [createHistory('Admin Geral', 'Tarefa criada', day)],
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
    checklists: [
      { id: 'c1', title: 'Reunião com TI', completed: true },
      { id: 'c2', title: 'Atualizar docs', completed: false },
    ],
    history: [createHistory('Admin Geral', 'Tarefa criada', day * 2)],
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
    checklists: [],
    history: [createHistory('Mariana Rios', 'Tarefa criada', day)],
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
    checklists: [
      { id: 'c1', title: 'Comprar materiais', completed: true },
      { id: 'c2', title: 'Configurar e-mails', completed: true },
    ],
    history: [createHistory('Pedro Souza', 'Tarefa criada', day * 8)],
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
    checklists: [],
    history: [createHistory('Pedro Souza', 'Tarefa criada', day)],
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
    checklists: [
      { id: 'c1', title: 'Validar ponto', completed: true },
      { id: 'c2', title: 'Aprovar bônus', completed: false },
    ],
    history: [createHistory('Admin Geral', 'Tarefa criada', day * 2)],
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
    checklists: [],
    history: [createHistory('Mariana Rios', 'Tarefa criada', day)],
    createdAt: new Date(now - day).toISOString(),
  },
  {
    id: 't8',
    title: 'Reunião de alinhamento com marketing',
    description: 'Definir budget para o próximo trimestre.',
    status: 'DONE',
    priority: 'MEDIUM',
    dueDate: new Date(now - day * 3).toISOString(),
    delegator: 'Admin Geral',
    assignee: A_AC,
    checklists: [],
    history: [createHistory('Admin Geral', 'Tarefa criada', day * 5)],
    createdAt: new Date(now - day * 5).toISOString(),
  },
  {
    id: 't9',
    title: 'Comprar passagens para o evento',
    description: 'Cotar voos e hotéis para a conferência anual.',
    status: 'REVIEW',
    priority: 'URGENT',
    dueDate: new Date(now + day).toISOString(),
    delegator: 'Mariana Rios',
    assignee: A_MO,
    checklists: [],
    history: [createHistory('Mariana Rios', 'Tarefa criada', day)],
    createdAt: new Date(now - day).toISOString(),
  },
  {
    id: 't10',
    title: 'Atualizar cadastro de clientes',
    description: 'Limpar base de dados no CRM.',
    status: 'TODO',
    priority: 'LOW',
    dueDate: new Date(now + day * 2).toISOString(),
    delegator: 'Pedro Souza',
    assignee: A_JS,
    checklists: [
      { id: 'c1', title: 'Exportar lista', completed: false },
      { id: 'c2', title: 'Remover duplicados', completed: false },
      { id: 'c3', title: 'Importar lista limpa', completed: false },
    ],
    history: [createHistory('Pedro Souza', 'Tarefa criada', day)],
    createdAt: new Date(now - day).toISOString(),
  },
  {
    id: 't11',
    title: 'Organizar confraternização',
    description: 'Reservar local e definir cardápio.',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    dueDate: new Date(now + day * 6).toISOString(),
    delegator: 'Admin Geral',
    assignee: A_AC,
    checklists: [],
    history: [createHistory('Admin Geral', 'Tarefa criada', day * 2)],
    createdAt: new Date(now - day * 2).toISOString(),
  },
  {
    id: 't12',
    title: 'Revisar contratos pendentes',
    description: 'Assinar NDA com novos fornecedores.',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: new Date(now - day).toISOString(),
    delegator: 'Mariana Rios',
    assignee: A_CS,
    checklists: [
      { id: 'c1', title: 'Ler minuta', completed: true },
      { id: 'c2', title: 'Assinar digitalmente', completed: false },
    ],
    history: [createHistory('Mariana Rios', 'Tarefa criada', day * 3)],
    createdAt: new Date(now - day * 3).toISOString(),
  },
  {
    id: 't13',
    title: 'Treinamento de segurança',
    description: 'Participar do workshop obrigatório da CIPA.',
    status: 'REVIEW',
    priority: 'MEDIUM',
    dueDate: new Date(now).toISOString(),
    delegator: 'Admin Geral',
    assignee: A_JS,
    checklists: [],
    history: [createHistory('Admin Geral', 'Tarefa criada', day)],
    createdAt: new Date(now - day).toISOString(),
  },
  {
    id: 't14',
    title: 'Enviar newsletter mensal',
    description: 'Disparar e-mail marketing de outubro.',
    status: 'DONE',
    priority: 'LOW',
    dueDate: new Date(now - day * 10).toISOString(),
    delegator: 'Pedro Souza',
    assignee: A_MO,
    checklists: [],
    history: [createHistory('Pedro Souza', 'Tarefa criada', day * 12)],
    createdAt: new Date(now - day * 12).toISOString(),
  },
  {
    id: 't15',
    title: 'Analisar métricas de SEO',
    description: 'Extrair dados do Google Analytics.',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: new Date(now + day * 4).toISOString(),
    delegator: 'Mariana Rios',
    assignee: A_AC,
    checklists: [],
    history: [createHistory('Mariana Rios', 'Tarefa criada', day)],
    createdAt: new Date(now - day).toISOString(),
  },
  {
    id: 't16',
    title: 'Entrevista com candidatos',
    description: 'Entrevistar 3 devs frontend.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: new Date(now + day).toISOString(),
    delegator: 'Admin Geral',
    assignee: A_CS,
    checklists: [
      { id: 'c1', title: 'Candidato A', completed: true },
      { id: 'c2', title: 'Candidato B', completed: true },
      { id: 'c3', title: 'Candidato C', completed: false },
    ],
    history: [createHistory('Admin Geral', 'Tarefa criada', day * 4)],
    createdAt: new Date(now - day * 4).toISOString(),
  },
  {
    id: 't17',
    title: 'Planejamento estratégico Q4',
    description: 'Definir OKRs do último trimestre.',
    status: 'REVIEW',
    priority: 'URGENT',
    dueDate: new Date(now).toISOString(),
    delegator: 'Pedro Souza',
    assignee: A_JS,
    checklists: [],
    history: [createHistory('Pedro Souza', 'Tarefa criada', day)],
    createdAt: new Date(now - day).toISOString(),
  },
  {
    id: 't18',
    title: 'Backup dos servidores',
    description: 'Garantir rotina de backup da base principal.',
    status: 'DONE',
    priority: 'HIGH',
    dueDate: new Date(now - day * 2).toISOString(),
    delegator: 'Mariana Rios',
    assignee: A_MO,
    checklists: [],
    history: [createHistory('Mariana Rios', 'Tarefa criada', day * 5)],
    createdAt: new Date(now - day * 5).toISOString(),
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
            description: `Movida para ${status === 'TODO' ? 'A Fazer' : status === 'IN_PROGRESS' ? 'Em Progresso' : status === 'REVIEW' ? 'Em Revisão' : 'Concluída'}`,
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

  const updateTaskDescription = (taskId: string, description: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.description !== description) {
          const historyAction: TaskHistory = {
            id: Math.random().toString(),
            action: 'UPDATED',
            description: 'Descrição da tarefa atualizada',
            performedBy: user?.name || 'Sistema',
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
    { value: { tasks, updateTaskStatus, toggleChecklist, updateTaskDescription } },
    children,
  )
}

export default function useTaskStore() {
  const context = useContext(TaskContext)
  if (!context) throw new Error('useTaskStore must be used within TaskProvider')
  return context
}
