import { useState, useEffect } from 'react'
import { getTasks, updateTask, TaskRecord } from '@/services/tasks'
import { getUsers } from '@/services/users'
import { getChecklists, ChecklistRecord } from '@/services/checklists'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuthHooks'
import { getErrorMessage } from '@/lib/pocketbase/errors'
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
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const { toast } = useToast()

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

  const statuses: { id: TaskRecord['status']; label: string }[] = [
    { id: 'todo', label: 'A Fazer' },
    { id: 'in_progress', label: 'Em Progresso' },
    { id: 'review', label: 'Em Revisão' },
    { id: 'done', label: 'Concluído' },
  ]

  const filteredTasks = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())

    // In team view, archived tasks are hidden to keep focus
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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id)
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDrop = async (e: React.DragEvent, status: TaskRecord['status']) => {
    e.preventDefault()
    const draggedId = e.dataTransfer.getData('text/plain')?.trim()
    if (!draggedId) {
      setDraggedTaskId(null)
      return
    }

    const taskToUpdate = tasks.find((t) => t.id === draggedId)
    if (!taskToUpdate || taskToUpdate.status === status) {
      setDraggedTaskId(null)
      return
    }

    const previousTasks = [...tasks]
    setTasks((prev) => prev.map((t) => (t.id === taskToUpdate.id ? { ...t, status } : t)))
    setDraggedTaskId(null)

    try {
      await updateTask(taskToUpdate.id, { status })
    } catch (error) {
      setTasks(previousTasks)
      toast({
        title: 'Erro ao mover tarefa',
        description: getErrorMessage(error) || 'A tarefa retornou para a sua posição original.',
        variant: 'destructive',
      })
    }
  }

  const handleDelegate = async (taskId: string, userId: string) => {
    const previousTasks = [...tasks]
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, delegated_to: userId } : t)))
    try {
      await updateTask(taskId, { delegated_to: userId })
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

  const boardContent = (
    <div className="flex-1 flex gap-5 overflow-x-auto pb-4 items-start px-1 custom-scrollbar">
      {statuses.map((col, index) => {
        const colTasks = filteredTasks.filter((t) => t.status === col.id)
        return (
          <div
            key={col.id}
            className={`stagger-item stagger-${(index % 5) + 2} flex flex-col glass-card rounded-[2rem] p-4 min-w-[340px] w-[340px] h-full transition-colors hover:bg-white/50 dark:hover:bg-slate-900/50`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-extrabold text-[13px] uppercase tracking-widest flex items-center gap-2 text-foreground/80">
                {col.label}{' '}
                <span className="bg-background/90 backdrop-blur-md border border-border/50 px-2.5 py-0.5 rounded-full text-xs shadow-sm text-foreground">
                  {colTasks.length}
                </span>
              </h3>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar min-h-[150px]">
              {colTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  checklists={checklists.filter((c) => c.task_id === task.id)}
                  onClick={() => setSelectedTaskId(task.id)}
                  onDragStart={(e: React.DragEvent) => handleDragStart(e, task.id)}
                  onDragEnd={() => setDraggedTaskId(null)}
                  isDragging={draggedTaskId === task.id}
                  isAdmin={isAdmin}
                  users={users}
                  onDelegate={handleDelegate}
                />
              ))}
              {colTasks.length === 0 && (
                <div className="h-28 border-2 border-dashed border-border/60 rounded-3xl flex items-center justify-center text-sm text-muted-foreground font-medium bg-background/20 backdrop-blur-sm">
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
      <div className="h-full flex flex-col pb-4">
        <div className="flex flex-col mb-6 glass-card p-6 rounded-3xl gap-4 stagger-item stagger-1">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl hidden md:flex backdrop-blur-md shadow-sm border border-white/10">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  {isAdmin ? 'Tarefas Funcionário' : 'Quadro de Tarefas'}
                </h1>
                <p className="text-sm font-medium text-muted-foreground mt-1">
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

        {isAdmin ? (
          <Tabs value={activeTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsContent
              value="private"
              className="flex-1 mt-0 outline-none overflow-hidden h-full flex flex-col"
            >
              {boardContent}
            </TabsContent>
            <TabsContent
              value="team"
              className="flex-1 mt-0 outline-none overflow-hidden h-full flex flex-col"
            >
              {boardContent}
            </TabsContent>
          </Tabs>
        ) : (
          boardContent
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
