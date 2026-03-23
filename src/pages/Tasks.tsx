import { useState } from 'react'
import useTaskStore, { TaskStatus } from '@/stores/useTaskStore'
import TaskCard from '@/components/TaskCard'
import TaskModal from '@/components/TaskModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search, Filter, Plus, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isToday, isThisWeek, isPast, parseISO } from 'date-fns'

export default function Tasks() {
  const { tasks, updateTaskStatus } = useTaskStore()
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('ALL')
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL')
  const [filterDeadline, setFilterDeadline] = useState<string>('ALL')
  const [filterDelegator, setFilterDelegator] = useState<string>('ALL')
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null)

  const statuses: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'TODO', label: 'A Fazer', color: 'bg-slate-400' },
    { id: 'IN_PROGRESS', label: 'Em Progresso', color: 'bg-blue-500' },
    { id: 'REVIEW', label: 'Em Revisão', color: 'bg-purple-500' },
    { id: 'DONE', label: 'Concluído', color: 'bg-green-500' },
  ]

  const assignees = Array.from(
    new Set(tasks.map((t) => t.assignee?.name).filter(Boolean)),
  ) as string[]
  const delegators = Array.from(new Set(tasks.map((t) => t.delegator).filter(Boolean))) as string[]

  const filteredTasks = tasks.filter((t) => {
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

  const hasActiveFilters =
    filterAssignee !== 'ALL' ||
    filterPriority !== 'ALL' ||
    filterDeadline !== 'ALL' ||
    filterDelegator !== 'ALL'

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCol !== status) {
      setDragOverCol(status)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
    setDragOverCol(null)
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    setDragOverCol(null)
    const id = e.dataTransfer.getData('text/plain')
    if (id && id !== '') {
      updateTaskStatus(id, status)
    }
    setDraggedTaskId(null)
  }

  return (
    <div className="h-full flex flex-col animate-fade-in pb-4">
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

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background border-border shadow-sm"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={hasActiveFilters ? 'default' : 'outline'}
                className="gap-2 shadow-sm whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-background text-primary text-[10px] font-bold ml-1">
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

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Responsável
                  </Label>
                  <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                    <SelectTrigger className="h-9">
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

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Prioridade
                  </Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="h-9">
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

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Prazo (Deadline)
                  </Label>
                  <Select value={filterDeadline} onValueChange={setFilterDeadline}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Qualquer prazo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Qualquer prazo</SelectItem>
                      <SelectItem value="TODAY">Hoje</SelectItem>
                      <SelectItem value="THIS_WEEK">Esta semana</SelectItem>
                      <SelectItem value="OVERDUE">Atrasadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Delegado Por
                  </Label>
                  <Select value={filterDelegator} onValueChange={setFilterDelegator}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos os Delegadores</SelectItem>
                      {delegators.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
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
        </div>
      </div>

      <div className="flex-1 flex gap-5 overflow-x-auto pb-4 items-start h-full px-1">
        {statuses.map((col) => {
          const columnTasks = filteredTasks.filter((t) => t.status === col.id)
          return (
            <div
              key={col.id}
              className={cn(
                'flex flex-col bg-muted/40 rounded-2xl p-4 min-w-[320px] w-[320px] border max-h-full transition-all duration-200 shadow-sm',
                dragOverCol === col.id
                  ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
                  : 'border-border/50',
              )}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
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
                    onDragEnd={handleDragEnd}
                    isDragging={draggedTaskId === task.id}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <div className="h-28 border-2 border-dashed border-border/80 rounded-xl flex items-center justify-center text-sm text-muted-foreground font-medium bg-background/30">
                    Nenhuma tarefa aqui
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
    </div>
  )
}
