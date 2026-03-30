import { useState, useEffect } from 'react'
import { getTasks, updateTask, TaskRecord } from '@/services/tasks'
import { getUsers } from '@/services/users'
import { getChecklists, ChecklistRecord } from '@/services/checklists'
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
import { Plus, LayoutDashboard, Search, Archive, Users, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Tasks() {
  const { user, role } = useAuth()
  const isAdmin = role === 'ADMIN' || role === 'admin'

  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [checklists, setChecklists] = useState<ChecklistRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const [activeTab, setActiveTab] = useState<'team' | 'private'>('private')
  const [employeeFilter, setEmployeeFilter] = useState('all')

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)

  const { toast } = useToast()

  const handlePointerDrop = async (taskId: string, columnId: string) => {
    const taskToUpdate = tasks.find((t) => t.id === taskId)
    const targetStatus = columnId as TaskRecord['status']

    if (!taskToUpdate || taskToUpdate.status === targetStatus) return

    const previousTasks = [...tasks]
    setTasks((prev) =>
      prev.map((t) => (t.id === taskToUpdate.id ? { ...t, status: targetStatus } : t)),
    )

    try {
      await updateTask(taskToUpdate.id, { status: targetStatus }, taskToUpdate.updated)
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
      const [tData, uData, cData] = await Promise.all([getTasks(), getUsers(), getChecklists()])
      setTasks(tData)
      setUsers(uData)
      setChecklists(cData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('tasks', () => loadData())
  useRealtime('checklists', () => loadData())

  const statuses: { id: TaskRecord['status']; label: string; colorClass: string }[] = [
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

  const filteredTasks = tasks.filter((t) => {
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

    return matchSearch && matchArchive && matchView
  })

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

  if (loading) return <BoardSkeleton />

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null

  const draggedTask = dragState?.isDragging ? tasks.find((t) => t.id === dragState.taskId) : null

  const boardContent = (
    <div className="flex-1 flex gap-5 overflow-x-auto overflow-y-hidden items-stretch px-1 pb-4 custom-scrollbar min-h-0 snap-x snap-mandatory relative">
      {statuses.map((col, index) => {
        const colTasks = filteredTasks.filter((t) => t.status === col.id)
        const isHovered = dragState?.hoveredColumn === col.id
        return (
          <div
            key={col.id}
            data-column={col.id}
            className={cn(
              `snap-center shrink-0 stagger-item stagger-${(index % 5) + 2} flex flex-col glass-card rounded-3xl p-4 md:p-5 w-[310px] md:w-[330px] h-full transition-all border border-border/50 shadow-sm`,
              isHovered
                ? 'bg-primary/5 border-primary/40 ring-2 ring-primary/20 scale-[1.01]'
                : 'hover:bg-white/40 dark:hover:bg-slate-900/40',
            )}
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
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 custom-scrollbar px-2 -mx-2 pt-1 pb-4 space-y-3.5 touch-pan-y">
              {colTasks.map((task) => (
                <div key={task.id} data-task-id={task.id} className="relative">
                  <TaskCard
                    task={task}
                    checklists={checklists.filter((c) => c.task_id === task.id)}
                    onClick={() => {
                      if (dragState?.isDragging) return
                      setSelectedTaskId(task.id)
                    }}
                    onPointerDown={(e) => handlePointerDown(e, task.id)}
                    isDragging={dragState?.taskId === task.id}
                    isAdmin={isAdmin}
                    users={users}
                    onDelegate={handleDelegate}
                  />
                </div>
              ))}
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

  return (
    <PageTransition>
      <div className="h-full flex flex-col min-h-0 overflow-hidden gap-4">
        <div className="flex-shrink-0 flex flex-col glass-card p-5 md:p-6 rounded-3xl gap-4 stagger-item stagger-1">
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
                  Gerencie suas atividades e ganhe pontos no PRN Organizador.
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

          {isAdmin && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2 pt-4 border-t border-border/40">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="w-full sm:w-auto"
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
              {activeTab === 'team' && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Filtrar:
                  </span>
                  <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-background/50 border-border/50 rounded-xl">
                      <SelectValue placeholder="Todos os funcionários" />
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
                </div>
              )}
            </div>
          )}
        </div>

        {dragState?.isDragging && draggedTask && (
          <div
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: dragState.elementPos.width,
              height: dragState.elementPos.height,
              transform: `translate(${
                dragState.currentPos.x - (dragState.initialPos.x - dragState.elementPos.x)
              }px, ${
                dragState.currentPos.y - (dragState.initialPos.y - dragState.elementPos.y)
              }px) rotate(3deg)`,
              pointerEvents: 'none',
              zIndex: 9999,
              transition: 'transform 0.05s ease-out',
            }}
            className="opacity-95 drop-shadow-2xl scale-105 pointer-events-none [&_*]:pointer-events-none"
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
