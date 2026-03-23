import { useState, useEffect } from 'react'
import useTaskStore, { Priority, TaskStatus } from '@/stores/useTaskStore'
import useAuthStore, { SYSTEM_USERS } from '@/stores/useAuthStore'
import { Permissions } from '@/lib/permissions'
import PermissionGuard from '@/components/PermissionGuard'
import TaskCard from '@/components/TaskCard'
import TaskModal from '@/components/TaskModal'
import BoardSkeleton from '@/components/BoardSkeleton'
import PageTransition from '@/components/PageTransition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Search,
  Filter,
  Plus,
  LayoutDashboard,
  Inbox,
  ArrowRight,
  MousePointerClick,
  CheckSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isToday, isThisWeek, isPast, parseISO } from 'date-fns'

export default function Tasks() {
  const { tasks, updateTaskStatus, addTask } = useTaskStore()
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('ALL')
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL')
  const [filterDeadline, setFilterDeadline] = useState<string>('ALL')
  const [filterDelegator, setFilterDelegator] = useState<string>('ALL')
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null)

  // Create Task State
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'LOW' as Priority,
    dueDate: '',
    assigneeId: user?.id,
  })

  // Onboarding States
  const [showWelcome, setShowWelcome] = useState(false)
  const [tourStep, setTourStep] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      const done = localStorage.getItem('prn_tour_done')
      if (!done) setShowWelcome(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (user && isNewTaskOpen) {
      setNewTask((prev) => ({ ...prev, assigneeId: user.id }))
    }
  }, [user, isNewTaskOpen])

  const startTour = () => {
    setShowWelcome(false)
    setTourStep(1)
  }

  const endTour = () => {
    setTourStep(0)
    localStorage.setItem('prn_tour_done', 'true')
  }

  const statuses: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'TODO', label: 'A Fazer', color: 'bg-slate-400' },
    { id: 'IN_PROGRESS', label: 'Em Progresso', color: 'bg-blue-500' },
    { id: 'REVIEW', label: 'Em Revisão', color: 'bg-purple-500' },
    { id: 'DONE', label: 'Concluído', color: 'bg-green-500' },
  ]

  // Middleware / Data Isolation: Only show tasks visible to this user
  const visibleTasks = tasks.filter((t) => {
    if (Permissions.canViewOthersTasks(user?.role)) return true
    return t.assignee?.id === user?.id || t.delegatorId === user?.id
  })

  const assignees = Array.from(
    new Set(visibleTasks.map((t) => t.assignee?.name).filter(Boolean)),
  ) as string[]
  const delegators = Array.from(
    new Set(visibleTasks.map((t) => t.delegator).filter(Boolean)),
  ) as string[]

  const filteredTasks = visibleTasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description?.toLowerCase() || '').includes(search.toLowerCase())
    const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority
    const matchAssignee = filterAssignee === 'ALL' || t.assignee?.name === filterAssignee
    const matchDelegator = filterDelegator === 'ALL' || t.delegator === filterDelegator

    let matchDeadline = true
    if (filterDeadline !== 'ALL') {
      if (!t.dueDate) {
        matchDeadline = false
      } else {
        const date = parseISO(t.dueDate)
        if (filterDeadline === 'TODAY') matchDeadline = isToday(date)
        else if (filterDeadline === 'THIS_WEEK') matchDeadline = isThisWeek(date)
        else if (filterDeadline === 'OVERDUE') matchDeadline = isPast(date) && !isToday(date)
      }
    }

    return matchSearch && matchPriority && matchAssignee && matchDelegator && matchDeadline
  })

  const hasActiveFilters = [filterAssignee, filterPriority, filterDeadline, filterDelegator].some(
    (f) => f !== 'ALL',
  )

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCol !== status) setDragOverCol(status)
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    setDragOverCol(null)
    const id = e.dataTransfer.getData('text/plain')
    if (id && id !== '') updateTaskStatus(id, status)
    setDraggedTaskId(null)
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title || !user) return

    const selectedAssignee = SYSTEM_USERS.find((u) => u.id === newTask.assigneeId)

    addTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'TODO',
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
      delegator: user.name,
      delegatorId: user.id,
      assignee: selectedAssignee
        ? {
            id: selectedAssignee.id,
            name: selectedAssignee.name,
            avatar: selectedAssignee.avatar || '',
          }
        : null,
    })

    setIsNewTaskOpen(false)
    setNewTask({ title: '', description: '', priority: 'LOW', dueDate: '', assigneeId: user.id })
  }

  if (loading) return <BoardSkeleton />

  return (
    <PageTransition>
      <div className="h-full flex flex-col pb-4 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 bg-card p-5 rounded-2xl shadow-subtle border border-border/50 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl hidden md:flex">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground leading-none mb-1">Meu Board</h1>
              <p className="text-sm text-muted-foreground font-medium">
                Gerencie e organize suas tarefas com eficiência.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background border-border shadow-sm focus-visible:ring-primary"
                aria-label="Buscar tarefas"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={hasActiveFilters ? 'default' : 'outline'}
                  className="gap-2 shadow-sm whitespace-nowrap"
                  aria-label="Filtrar tarefas"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filtros</span>
                  {hasActiveFilters && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-background text-primary text-[10px] font-bold sm:ml-1">
                      {
                        [filterAssignee, filterPriority, filterDeadline, filterDelegator].filter(
                          (f) => f !== 'ALL',
                        ).length
                      }
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[320px] p-5 shadow-elevation rounded-xl border-border/80"
                align="end"
              >
                <div className="space-y-4">
                  <h4 className="font-bold text-sm flex items-center gap-2 border-b pb-3 mb-2">
                    <Filter className="w-4 h-4 text-primary" /> Filtros Avançados
                  </h4>

                  <PermissionGuard check={Permissions.canViewOthersTasks}>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Responsável
                      </Label>
                      <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                        <SelectTrigger aria-label="Filtrar por responsável" className="h-9">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Todos os Responsáveis</SelectItem>
                          {assignees.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </PermissionGuard>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Prioridade
                    </Label>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger aria-label="Filtrar por prioridade" className="h-9">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todas as Prioridades</SelectItem>
                        <SelectItem value="URGENT">Urgente</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                        <SelectItem value="MEDIUM">Média</SelectItem>
                        <SelectItem value="LOW">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      aria-label="Limpar filtros"
                      className="w-full h-9 text-xs mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setFilterAssignee('ALL')
                        setFilterPriority('ALL')
                        setFilterDeadline('ALL')
                        setFilterDelegator('ALL')
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Button onClick={() => setIsNewTaskOpen(true)} className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nova Tarefa</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-5 overflow-y-auto md:overflow-y-hidden md:overflow-x-auto pb-4 items-start h-full px-1">
          {statuses.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id)
            return (
              <div
                key={col.id}
                className={cn(
                  'flex flex-col bg-muted/40 rounded-2xl p-4 w-full md:min-w-[320px] md:w-[320px] border max-h-full transition-all duration-200 shadow-sm shrink-0',
                  dragOverCol === col.id
                    ? 'bg-primary/5 border-primary/40 ring-2 ring-primary/20'
                    : 'border-border/50',
                )}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => {
                  e.preventDefault()
                  setDragOverCol(null)
                }}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2.5 uppercase tracking-wide">
                    <span className={cn('w-2.5 h-2.5 rounded-full shadow-sm', col.color)}></span>
                    {col.label}
                    <span className="bg-background px-2.5 py-0.5 rounded-full text-xs font-semibold text-muted-foreground shadow-sm border border-border/60 ml-1">
                      {columnTasks.length}
                    </span>
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Adicionar tarefa em ${col.label}`}
                    onClick={() => setIsNewTaskOpen(true)}
                    className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1 space-y-3.5 overflow-y-auto pr-2 pb-2 custom-scrollbar min-h-[150px]">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => setSelectedTask(task.id)}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={() => {
                        setDraggedTaskId(null)
                        setDragOverCol(null)
                      }}
                      isDragging={draggedTaskId === task.id}
                    />
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-border/80 rounded-xl flex flex-col items-center justify-center text-center p-4 bg-background/30 transition-all hover:bg-muted/50">
                      <Inbox className="w-8 h-8 text-muted-foreground/50 mb-2 animate-pulse" />
                      <span className="text-sm text-muted-foreground font-medium">Sem tarefas</span>
                      {col.id === 'TODO' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsNewTaskOpen(true)}
                          className="h-8 mt-3 text-xs shadow-sm hover:scale-105 transition-transform"
                        >
                          Criar primeira tarefa
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <TaskModal
          taskId={selectedTask}
          open={!!selectedTask}
          onOpenChange={(op) => !op && setSelectedTask(null)}
        />

        {/* Dialog Nova Tarefa */}
        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
              <DialogDescription>Adicione detalhes para a nova atividade.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Nome da tarefa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Descrição</Label>
                <Textarea
                  id="desc"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Detalhes opcionais..."
                  className="resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(v: Priority) => setNewTask({ ...newTask, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Prazo Final</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <PermissionGuard check={Permissions.canDelegateTasks}>
                <div className="space-y-2">
                  <Label>Atribuir a (Opcional)</Label>
                  <Select
                    value={newTask.assigneeId || 'unassigned'}
                    onValueChange={(v) =>
                      setNewTask({ ...newTask, assigneeId: v === 'unassigned' ? undefined : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Sem responsável</SelectItem>
                      {SYSTEM_USERS.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </PermissionGuard>

              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => setIsNewTaskOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!newTask.title}>
                  Salvar Tarefa
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Onboarding Highlights */}
        <Dialog
          open={showWelcome}
          onOpenChange={(op) => {
            if (!op) endTour()
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <span className="text-3xl">👋</span> Bem-vindo ao PRN CRM
              </DialogTitle>
              <DialogDescription className="pt-2 text-base text-foreground/80">
                Sua nova plataforma de gestão e produtividade gamificada. Vamos fazer um tour rápido
                para você conhecer as principais funcionalidades?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={endTour}>
                Pular e ver depois
              </Button>
              <Button onClick={startTour}>Começar Tour</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {tourStep === 1 && (
          <div className="fixed inset-0 z-[100] bg-black/60 flex flex-col items-center justify-center p-4">
            <div className="bg-card border border-border p-6 rounded-2xl shadow-elevation animate-bounce-in max-w-sm w-full text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-2">Aqui estão suas tarefas</h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                O Kanban organiza suas pendências em colunas. Novas demandas e afazeres aparecerão
                aqui em "A Fazer".
              </p>
              <div className="flex justify-between items-center gap-3">
                <Button variant="ghost" className="flex-1" onClick={endTour}>
                  Pular Tour
                </Button>
                <Button className="flex-1" onClick={() => setTourStep(2)}>
                  Próximo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {tourStep === 2 && (
          <div className="fixed inset-0 z-[100] bg-black/60 flex flex-col items-center justify-center p-4">
            <div className="bg-card border border-border p-6 rounded-2xl shadow-elevation animate-bounce-in max-w-sm w-full text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-2">
                Arraste para mudar o status
              </h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Mova os cartões entre as colunas para atualizar o andamento das suas atividades e
                ganhar pontos na plataforma!
              </p>
              <Button className="w-full" onClick={endTour}>
                Começar a usar!
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
