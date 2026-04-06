import { useState, useEffect, useMemo } from 'react'
import { getTasks, updateTask, updateTaskOrder, TaskRecord } from '@/services/tasks'
import { getUsers } from '@/services/users'
import { getChecklists, ChecklistRecord } from '@/services/checklists'
import { getProjects, ProjectRecord } from '@/services/projects'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuthHooks'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { usePointerDnD } from '@/hooks/use-pointer-dnd'
import TaskCard from '@/components/TaskCard'
import TaskModal from '@/components/TaskModal'
import NewTaskDialog from '@/components/NewTaskDialog'
import BoardSkeleton from '@/components/BoardSkeleton'
import PageTransition from '@/components/PageTransition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, LayoutDashboard, Search, Archive, Users, Lock, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { isPast, isSameDay, isSameWeek } from 'date-fns'

export default function Tasks() {
  const { user, role } = useAuth()
  const isAdmin = role === 'ADMIN' || role === 'admin'

  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [checklists, setChecklists] = useState<ChecklistRecord[]>([])
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const [activeTab, setActiveTab] = useState<'team' | 'private'>('private')

  // Filters
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [areaFilter, setAreaFilter] = useState('all')
  const [deadlineFilter, setDeadlineFilter] = useState('all')
  const [groupBy, setGroupBy] = useState<'status' | 'project'>('status')
  const [myTasksOnly, setMyTasksOnly] = useState(false)

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)

  const { toast } = useToast()

  const handlePointerDrop = async (taskId: string, columnId: string, dropIndex: number) => {
    const taskToUpdate = tasks.find((t) => t.id === taskId)
    if (!taskToUpdate) return

    let targetStatus = taskToUpdate.status
    let targetProject = taskToUpdate.project_id || ''

    if (groupBy === 'status') {
      targetStatus = columnId as TaskRecord['status']
    } else {
      targetProject = columnId === 'none' ? '' : columnId
    }

    const colTasks = tasks
      .filter((t) => {
        if (groupBy === 'status') return t.status === targetStatus
        return (t.project_id || 'none') === (targetProject || 'none')
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    const otherTasks = colTasks.filter((t) => t.id !== taskId)

    let newOrder = 0
    if (otherTasks.length === 0) {
      newOrder = 1024
    } else if (dropIndex <= 0) {
      newOrder = (otherTasks[0].order || 1024) - 1024
    } else if (dropIndex >= otherTasks.length) {
      newOrder = (otherTasks[otherTasks.length - 1].order || 0) + 1024
    } else {
      const prevOrder = otherTasks[dropIndex - 1].order || 0
      const nextOrder = otherTasks[dropIndex].order || 0
      newOrder = (prevOrder + nextOrder) / 2
    }

    if (
      (groupBy === 'status' &&
        taskToUpdate.status === targetStatus &&
        Math.abs((taskToUpdate.order || 0) - newOrder) < 0.001) ||
      (groupBy === 'project' &&
        (taskToUpdate.project_id || '') === targetProject &&
        Math.abs((taskToUpdate.order || 0) - newOrder) < 0.001)
    )
      return

    const previousTasks = [...tasks]
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskToUpdate.id
          ? { ...t, status: targetStatus, project_id: targetProject, order: newOrder }
          : t,
      ),
    )

    try {
      await updateTaskOrder([
        {
          id: taskToUpdate.id,
          order: newOrder,
          status: targetStatus,
          project_id: targetProject,
        },
      ])
    } catch (error) {
      setTasks(previousTasks)
      toast({
        title: 'Erro ao mover tarefa',
        description: getErrorMessage(error) || 'A tarefa retornou para a sua posição original.',
        variant: 'destructive',
      })
    }
  }

  const { handlePointerDown, dragState } = usePointerDnD({ onDrop: handlePointerDrop })

  const loadData = async () => {
    try {
      const [tData, uData, cData, pData] = await Promise.all([
        getTasks(),
        getUsers(),
        getChecklists(),
        getProjects(),
      ])
      setTasks(tData)
      setUsers(uData)
      setChecklists(cData)
      setProjects(pData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('tasks', () => loadData())
  useRealtime('checklists', () => loadData())
  useRealtime('projects', () => loadData())

  const statuses = [
    {
      id: 'todo',
      label: 'A Fazer',
      colorClass: 'bg-slate-400 dark:bg-slate-500 shadow-[0_0_10px_rgba(148,163,184,0.5)]',
    },
    {
      id: 'in_progress',
      label: 'Em Progresso',
      colorClass: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]',
    },
    {
      id: 'review',
      label: 'Em Revisão',
      colorClass: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]',
    },
    {
      id: 'done',
      label: 'Concluído',
      colorClass: 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]',
    },
  ]

  const areas = Array.from(new Set(tasks.map((t) => t.department).filter(Boolean)))

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())

        const effectiveShowArchived = isAdmin && activeTab === 'team' ? false : showArchived
        const matchArchive = effectiveShowArchived ? true : !t.is_archived

        let matchView = true

        if (isAdmin) {
          if (activeTab === 'private') {
            matchView = !!t.is_private && t.created_by === user?.id
          } else {
            matchView = !t.is_private
            if (employeeFilter !== 'all') {
              matchView = matchView && t.delegated_to === employeeFilter
            }
          }
        } else {
          matchView = !t.is_private
        }

        const matchPriority = priorityFilter === 'all' ? true : t.priority === priorityFilter
        const matchProject = projectFilter === 'all' ? true : t.project_id === projectFilter
        const matchArea = areaFilter === 'all' ? true : t.department === areaFilter
        const matchMyTasks = myTasksOnly
          ? t.delegated_to === user?.id || t.created_by === user?.id
          : true

        let matchDeadline = true
        if (deadlineFilter !== 'all') {
          if (!t.due_date) matchDeadline = false
          else {
            const due = new Date(t.due_date)
            const now = new Date()
            if (deadlineFilter === 'overdue') matchDeadline = t.status !== 'done' && isPast(due)
            else if (deadlineFilter === 'today') matchDeadline = isSameDay(due, now)
            else if (deadlineFilter === 'week')
              matchDeadline = isSameWeek(due, now, { weekStartsOn: 1 })
          }
        }

        return (
          matchSearch &&
          matchArchive &&
          matchView &&
          matchPriority &&
          matchProject &&
          matchArea &&
          matchMyTasks &&
          matchDeadline
        )
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [
    tasks,
    search,
    showArchived,
    activeTab,
    employeeFilter,
    priorityFilter,
    projectFilter,
    areaFilter,
    myTasksOnly,
    deadlineFilter,
    isAdmin,
    user?.id,
  ])

  const handleDelegate = async (taskId: string, userId: string) => {
    const taskToUpdate = tasks.find((t) => t.id === taskId)
    if (!taskToUpdate) return

    const previousTasks = [...tasks]
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, delegated_to: userId } : t)))
    try {
      await updateTask(taskId, { delegated_to: userId }, taskToUpdate.updated)
      toast({ title: 'Tarefa delegada com sucesso' })
    } catch (error) {
      setTasks(previousTasks)
      toast({
        title: 'Erro ao delegar',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    }
  }

  const columns = useMemo(() => {
    if (groupBy === 'status') {
      return statuses.map((s) => ({
        id: s.id,
        label: s.label,
        colorClass: s.colorClass,
        filterFn: (t: TaskRecord) => t.status === s.id,
      }))
    } else {
      return [
        {
          id: 'none',
          label: 'Sem Projeto',
          colorClass: 'bg-muted shadow-sm',
          filterFn: (t: TaskRecord) => !t.project_id,
        },
        ...projects.map((p) => ({
          id: p.id,
          label: p.name,
          colorClass: 'shadow-sm border border-border/50',
          colorStyle: p.color || '#888',
          filterFn: (t: TaskRecord) => t.project_id === p.id,
        })),
      ]
    }
  }, [groupBy, projects])

  if (loading) return <BoardSkeleton />

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null
  const draggedTask = dragState?.isDragging ? tasks.find((t) => t.id === dragState.taskId) : null

  const boardContent = (
    <div className="flex-1 flex gap-5 overflow-x-auto overflow-y-hidden items-stretch px-1 pb-4 custom-scrollbar min-h-0 snap-x snap-mandatory relative">
      {columns.map((col, index) => {
        const colTasks = filteredTasks.filter(col.filterFn)
        const isHovered = dragState?.hoveredColumn === col.id

        return (
          <div
            key={col.id}
            data-column={col.id}
            className={cn(
              `snap-center shrink-0 stagger-item flex flex-col glass-card rounded-3xl p-4 md:p-5 w-[310px] md:w-[330px] h-full transition-all border border-border/50 shadow-sm relative`,
              isHovered
                ? 'bg-primary/5 border-primary/40 ring-2 ring-primary/20 scale-[1.01]'
                : 'hover:bg-white/40 dark:hover:bg-slate-900/40',
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex-shrink-0 flex flex-col gap-3 mb-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-extrabold text-[14px] uppercase tracking-wider flex items-center gap-2 text-foreground/90">
                  {col.label}
                </h3>
                <span className="bg-background/90 backdrop-blur-md border border-border/50 px-2.5 py-0.5 rounded-full text-[11px] shadow-sm font-bold text-foreground">
                  {colTasks.length}
                </span>
              </div>
              <div className="h-[3px] w-full rounded-full bg-border/40 overflow-hidden">
                <div
                  className={cn('h-full rounded-full', col.colorClass)}
                  style={{ width: '100%', backgroundColor: (col as any).colorStyle }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 custom-scrollbar px-2 -mx-2 pt-1 pb-24 space-y-3.5 touch-pan-y relative">
              {colTasks.map((task, i) => {
                const isBeingDragged = dragState?.taskId === task.id

                return (
                  <div
                    key={task.id}
                    data-task-id={task.id}
                    className="relative transition-all duration-200"
                    style={{
                      marginTop:
                        dragState?.isDragging &&
                        isHovered &&
                        dragState.dropIndex === i &&
                        !isBeingDragged
                          ? `${dragState.elementPos.height}px`
                          : undefined,
                      marginBottom:
                        dragState?.isDragging &&
                        isHovered &&
                        dragState.dropIndex === colTasks.length &&
                        i === colTasks.length - 1 &&
                        !isBeingDragged
                          ? `${dragState.elementPos.height}px`
                          : undefined,
                    }}
                  >
                    <TaskCard
                      task={task}
                      checklists={checklists.filter((c) => c.task_id === task.id)}
                      onClick={() => {
                        if (dragState?.isDragging) return
                        setSelectedTaskId(task.id)
                      }}
                      onPointerDown={(e) => handlePointerDown(e, task.id)}
                      isDragging={isBeingDragged}
                      isAdmin={isAdmin}
                      users={users}
                      onDelegate={handleDelegate}
                    />
                  </div>
                )
              })}

              {colTasks.length === 0 && (
                <div className="h-28 border-2 border-dashed border-border/60 rounded-3xl flex items-center justify-center text-sm text-muted-foreground font-medium bg-background/20 backdrop-blur-sm m-1">
                  Solte as tarefas aqui
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  const activeFiltersCount =
    (employeeFilter !== 'all' ? 1 : 0) +
    (priorityFilter !== 'all' ? 1 : 0) +
    (projectFilter !== 'all' ? 1 : 0) +
    (areaFilter !== 'all' ? 1 : 0) +
    (deadlineFilter !== 'all' ? 1 : 0) +
    (myTasksOnly ? 1 : 0)

  return (
    <PageTransition>
      <div className="h-full flex flex-col min-h-0 overflow-hidden gap-4">
        <div className="flex-shrink-0 flex flex-col glass-card p-5 md:p-6 rounded-3xl gap-4 stagger-item stagger-1 z-20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl hidden md:flex backdrop-blur-md shadow-sm border border-white/10">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {isAdmin ? 'Tarefas Funcionário' : 'Quadro de Tarefas'}
                </h1>
                <p className="text-xs md:text-sm font-medium text-muted-foreground mt-1">
                  Gerencie atividades com precisão. Arraste para reordenar.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 w-full sm:w-56 glass-card border-white/20 focus:ring-primary rounded-xl"
                />
              </div>

              {(!isAdmin || activeTab === 'private') && (
                <Button
                  variant={showArchived ? 'secondary' : 'outline'}
                  onClick={() => setShowArchived(!showArchived)}
                  className="rounded-xl"
                >
                  <Archive className="w-4 h-4 sm:mr-2" />{' '}
                  <span className="hidden sm:inline">
                    {showArchived ? 'Ocultar' : 'Arquivados'}
                  </span>
                </Button>
              )}

              <Button
                onClick={() => setIsNewTaskOpen(true)}
                className="rounded-xl shadow-[0_0_15px_rgba(0,212,255,0.4)]"
              >
                <Plus className="w-4 h-4 sm:mr-2" />{' '}
                <span className="hidden sm:inline">Nova Tarefa</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mt-2 pt-4 border-t border-border/40">
            {isAdmin && (
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="w-full sm:w-auto shrink-0"
              >
                <TabsList className="bg-background/50 border border-border/50 p-1 rounded-xl">
                  <TabsTrigger
                    value="private"
                    className="rounded-lg gap-2 text-accent data-[state=active]:text-accent"
                  >
                    <Lock className="w-4 h-4" /> Meu Espaço
                  </TabsTrigger>
                  <TabsTrigger value="team" className="rounded-lg gap-2">
                    <Users className="w-4 h-4" /> Visão Equipe
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto bg-background/30 p-1.5 rounded-2xl border border-border/40 flex-1 xl:flex-none justify-end">
              <div className="flex items-center gap-2 px-2 text-sm font-semibold text-muted-foreground whitespace-nowrap">
                <Filter className="w-4 h-4" /> Filtros
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary/20 text-primary"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>

              <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
                <SelectTrigger className="w-[120px] h-9 bg-background/50 border-border/50 rounded-lg text-xs">
                  <SelectValue placeholder="Agrupar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Por Status</SelectItem>
                  <SelectItem value="project">Por Projeto</SelectItem>
                </SelectContent>
              </Select>

              <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                <SelectTrigger className="w-[110px] h-9 bg-background/50 border-border/50 rounded-lg text-xs">
                  <SelectValue placeholder="Prazo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Qualquer Prazo</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="overdue">Atrasado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[110px] h-9 bg-background/50 border-border/50 rounded-lg text-xs">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Qualquer</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>

              {groupBy !== 'project' && (
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-[110px] h-9 bg-background/50 border-border/50 rounded-lg text-xs">
                    <SelectValue placeholder="Projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {areas.length > 0 && (
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="w-[110px] h-9 bg-background/50 border-border/50 rounded-lg text-xs">
                    <SelectValue placeholder="Área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Áreas</SelectItem>
                    {areas.map((a: any) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {isAdmin && activeTab === 'team' && (
                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger className="w-[120px] h-9 bg-background/50 border-border/50 rounded-lg text-xs">
                    <SelectValue placeholder="Responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {users
                      .filter((u) => u.role?.toLowerCase() === 'employee')
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                variant={myTasksOnly ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'rounded-lg h-9 text-xs',
                  myTasksOnly && 'shadow-[0_0_10px_rgba(0,212,255,0.3)]',
                )}
                onClick={() => setMyTasksOnly(!myTasksOnly)}
              >
                Minhas Tarefas
              </Button>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => {
                    setMyTasksOnly(false)
                    setPriorityFilter('all')
                    setProjectFilter('all')
                    setAreaFilter('all')
                    setEmployeeFilter('all')
                    setDeadlineFilter('all')
                    setGroupBy('status')
                  }}
                  title="Limpar filtros"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {dragState?.isDragging && draggedTask && (
          <div
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: dragState.elementPos.width,
              height: dragState.elementPos.height,
              transform: `translate(${dragState.currentPos.x - (dragState.initialPos.x - dragState.elementPos.x)}px, ${dragState.currentPos.y - (dragState.initialPos.y - dragState.elementPos.y)}px) rotate(3deg)`,
              pointerEvents: 'none',
              zIndex: 9999,
            }}
            className="opacity-95 drop-shadow-2xl scale-105 pointer-events-none [&_*]:pointer-events-none transition-transform duration-75"
          >
            <TaskCard
              task={draggedTask}
              checklists={checklists.filter((c) => c.task_id === draggedTask.id)}
              onClick={() => {}}
              isAdmin={isAdmin}
              users={users}
            />
          </div>
        )}

        {isAdmin ? (
          <Tabs value={activeTab} className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
            <TabsContent
              value="private"
              className="flex-1 mt-0 outline-none data-[state=active]:flex flex-col min-h-0 overflow-hidden p-0 border-none w-full"
            >
              {boardContent}
            </TabsContent>
            <TabsContent
              value="team"
              className="flex-1 mt-0 outline-none data-[state=active]:flex flex-col min-h-0 overflow-hidden p-0 border-none w-full"
            >
              {boardContent}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">{boardContent}</div>
        )}

        <TaskModal
          task={selectedTask}
          open={!!selectedTaskId}
          onOpenChange={(op: boolean) => !op && setSelectedTaskId(null)}
          users={users}
          isAdmin={isAdmin}
        />
        <NewTaskDialog
          open={isNewTaskOpen}
          onOpenChange={setIsNewTaskOpen}
          users={users}
          isPrivateWorkspace={isAdmin && activeTab === 'private'}
        />
      </div>
    </PageTransition>
  )
}
