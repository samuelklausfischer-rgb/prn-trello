import { useState } from 'react'
import useTaskStore, { TaskStatus } from '@/stores/useTaskStore'
import TaskCard from '@/components/TaskCard'
import TaskSheet from '@/components/TaskSheet'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'

export default function Tasks() {
  const { tasks } = useTaskStore()
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  const statuses: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'TODO', label: 'Pendente', color: 'bg-slate-200 text-slate-800' },
    { id: 'IN_PROGRESS', label: 'Em Andamento', color: 'bg-blue-200 text-blue-800' },
    { id: 'REVIEW', label: 'Em Revisão', color: 'bg-purple-200 text-purple-800' },
    { id: 'DONE', label: 'Concluído', color: 'bg-success/20 text-success' },
  ]

  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description?.toLowerCase() || '').includes(search.toLowerCase())
    const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter
    return matchSearch && matchPriority
  })

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between bg-card p-4 rounded-xl shadow-subtle border border-border/50">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-primary/20 focus-visible:ring-primary/50"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background border-primary/20">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas Prioridades</SelectItem>
              <SelectItem value="URGENT">Urgente</SelectItem>
              <SelectItem value="HIGH">Alta</SelectItem>
              <SelectItem value="MEDIUM">Média</SelectItem>
              <SelectItem value="LOW">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 overflow-x-auto pb-4 items-start">
        {statuses.map((col) => {
          const columnTasks = filteredTasks.filter((t) => t.status === col.id)
          return (
            <div
              key={col.id}
              className="flex flex-col bg-muted/40 rounded-xl p-4 min-w-[280px] border border-border/40 shadow-sm max-h-full"
            >
              <h3 className="font-bold text-sm uppercase tracking-wider text-foreground mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.color.split(' ')[0]}`}></span>
                  {col.label}
                </span>
                <span className="bg-background px-2.5 py-0.5 rounded-full text-xs font-semibold text-muted-foreground shadow-sm border border-border/50">
                  {columnTasks.length}
                </span>
              </h3>
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground font-medium border-2 border-dashed border-border/60 rounded-lg">
                    Nenhuma tarefa
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task.id)} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      <TaskSheet
        taskId={selectedTask}
        open={!!selectedTask}
        onOpenChange={(op) => !op && setSelectedTask(null)}
      />
    </div>
  )
}
