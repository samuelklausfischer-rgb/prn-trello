import { useState, useEffect } from 'react'
import { getTasks, updateTask, TaskRecord } from '@/services/tasks'
import { getUsers } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import TaskCard from '@/components/TaskCard'
import TaskModal from '@/components/TaskModal'
import NewTaskDialog from '@/components/NewTaskDialog'
import BoardSkeleton from '@/components/BoardSkeleton'
import PageTransition from '@/components/PageTransition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, LayoutDashboard, Search, Archive } from 'lucide-react'

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [tData, uData] = await Promise.all([getTasks(), getUsers()])
      setTasks(tData)
      setUsers(uData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('tasks', () => {
    loadData()
  })

  const statuses = [
    { id: 'todo', label: 'A Fazer' },
    { id: 'in_progress', label: 'Em Progresso' },
    { id: 'review', label: 'Em Revisão' },
    { id: 'done', label: 'Concluído' },
  ]

  const filteredTasks = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchArchive = showArchived ? true : !t.is_archived
    return matchSearch && matchArchive
  })

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id)
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDrop = async (e: React.DragEvent, status: any) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) {
      await updateTask(id, { status })
    }
    setDraggedTaskId(null)
  }

  if (loading) return <BoardSkeleton />

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null

  return (
    <PageTransition>
      <div className="h-full flex flex-col pb-4">
        <div className="flex flex-col sm:flex-row justify-between mb-8 glass-card p-6 rounded-3xl gap-4 stagger-item stagger-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl hidden md:flex backdrop-blur-md shadow-sm border border-white/10">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Quadro de Tarefas</h1>
              <p className="text-sm font-medium text-muted-foreground mt-1">
                Gerencie suas atividades e ganhe pontos.
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
                className="pl-9 h-10 w-full sm:w-64 glass-card border-white/20 focus:ring-primary"
              />
            </div>
            <Button
              variant={showArchived ? 'secondary' : 'outline'}
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive className="w-4 h-4 mr-2" />{' '}
              {showArchived ? 'Ocultar Arquivados' : 'Mostrar Arquivados'}
            </Button>
            <Button onClick={() => setIsNewTaskOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Nova Tarefa
            </Button>
          </div>
        </div>

        <div className="flex-1 flex gap-5 overflow-x-auto pb-4 items-start px-1 custom-scrollbar">
          {statuses.map((col, index) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id)
            return (
              <div
                key={col.id}
                className={`stagger-item stagger-${(index % 5) + 2} flex flex-col glass-card rounded-2xl p-4 min-w-[320px] w-[320px] h-full transition-colors hover:bg-white/50 dark:hover:bg-slate-900/50`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-foreground/80">
                    {col.label}{' '}
                    <span className="bg-background/80 backdrop-blur-md border border-border/50 px-2 py-0.5 rounded-full text-xs shadow-sm">
                      {colTasks.length}
                    </span>
                  </h3>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar min-h-[150px]">
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => setSelectedTaskId(task.id)}
                      onDragStart={(e: React.DragEvent) => handleDragStart(e, task.id)}
                      onDragEnd={() => setDraggedTaskId(null)}
                      isDragging={draggedTaskId === task.id}
                    />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-border/60 rounded-xl flex items-center justify-center text-sm text-muted-foreground font-medium bg-background/20 backdrop-blur-sm">
                      Solte as tarefas aqui
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <TaskModal
          task={selectedTask}
          open={!!selectedTaskId}
          onOpenChange={(op: boolean) => !op && setSelectedTaskId(null)}
          users={users}
        />
        <NewTaskDialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen} users={users} />
      </div>
    </PageTransition>
  )
}
