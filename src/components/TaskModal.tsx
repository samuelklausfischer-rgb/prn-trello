import { useState, useEffect } from 'react'
import { TaskStatus, HistoryAction } from '@/stores/useTaskStore'
import useTaskStore from '@/stores/useTaskStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRightLeft,
  FileEdit,
  PlusCircle,
  Flag,
  UserPlus,
  Calendar,
  Archive,
  CheckSquare,
  ListTodo,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TaskModal({
  taskId,
  open,
  onOpenChange,
}: {
  taskId: string | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { tasks, updateTaskStatus, toggleChecklist, updateTaskDescription, addChecklistItem } =
    useTaskStore()
  const task = tasks.find((t) => t.id === taskId)

  const [desc, setDesc] = useState('')
  const [newChecklistTitle, setNewChecklistTitle] = useState('')

  useEffect(() => {
    if (task) setDesc(task.description)
  }, [task?.id, task?.description])

  if (!task) return null

  const totalChecklists = task.checklists.length
  const completedChecklists = task.checklists.filter((c) => c.completed).length
  const progressPercentage =
    totalChecklists === 0 ? 0 : Math.round((completedChecklists / totalChecklists) * 100)

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault()
    if (newChecklistTitle.trim() && task) {
      addChecklistItem(task.id, newChecklistTitle.trim())
      setNewChecklistTitle('')
    }
  }

  const getHistoryIcon = (action: HistoryAction) => {
    switch (action) {
      case 'TASK_CREATED':
        return <PlusCircle className="w-4 h-4 text-blue-500" />
      case 'STATUS_CHANGED':
        return <ArrowRightLeft className="w-4 h-4 text-orange-500" />
      case 'CHECKLIST_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'CHECKLIST_UNCOMPLETED':
        return <Circle className="w-4 h-4 text-gray-400" />
      case 'CHECKLIST_ADDED':
        return <CheckSquare className="w-4 h-4 text-purple-500" />
      case 'TASK_UPDATED':
        return <FileEdit className="w-4 h-4 text-indigo-500" />
      case 'PRIORITY_CHANGED':
        return <Flag className="w-4 h-4 text-red-500" />
      case 'DELEGATED':
        return <UserPlus className="w-4 h-4 text-teal-500" />
      case 'DUE_DATE_CHANGED':
        return <Calendar className="w-4 h-4 text-yellow-500" />
      case 'TASK_ARCHIVED':
        return <Archive className="w-4 h-4 text-gray-500" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0"
      >
        <DialogHeader className="p-6 pb-4 border-b space-y-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                task.priority === 'URGENT' &&
                  'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
                task.priority === 'HIGH' &&
                  'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
                task.priority === 'MEDIUM' &&
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
                task.priority === 'LOW' &&
                  'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
              )}
            >
              {task.priority === 'URGENT'
                ? 'Urgente'
                : task.priority === 'HIGH'
                  ? 'Alta'
                  : task.priority === 'MEDIUM'
                    ? 'Média'
                    : 'Baixa'}
            </span>
            {task.assignee && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                Responsável:{' '}
                <span className="font-semibold text-foreground">{task.assignee.name}</span>
              </span>
            )}
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold leading-tight text-foreground text-left">
            {task.title}
          </DialogTitle>
          <div className="flex items-center gap-4 pt-1">
            <Select
              value={task.status}
              onValueChange={(v: TaskStatus) => updateTaskStatus(task.id, v)}
            >
              <SelectTrigger
                aria-label="Mudar status"
                className="w-[160px] h-8 text-xs bg-background focus:ring-primary"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">A Fazer</SelectItem>
                <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                <SelectItem value="REVIEW">Em Revisão</SelectItem>
                <SelectItem value="DONE">Concluído</SelectItem>
              </SelectContent>
            </Select>
            {task.dueDate && (
              <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">
                Prazo: {format(parseISO(task.dueDate), 'dd/MM/yyyy')}
              </span>
            )}
          </div>
        </DialogHeader>

        <Tabs
          defaultValue="detalhes"
          className="flex-1 flex flex-col overflow-hidden min-h-[400px]"
        >
          <div className="px-6 pt-3 border-b border-border/50">
            <TabsList className="w-full grid grid-cols-3 h-10">
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              <TabsTrigger value="checklists" className="relative">
                Checklists
                {totalChecklists > 0 && completedChecklists < totalChecklists && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto bg-background">
            <TabsContent value="detalhes" className="m-0 h-full flex flex-col p-6 animate-fade-in">
              <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                Descrição da Tarefa
              </h4>
              <Textarea
                aria-label="Descrição da tarefa"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                onBlur={() => updateTaskDescription(task.id, desc)}
                className="flex-1 min-h-[250px] resize-none border-border/60 focus-visible:ring-primary shadow-sm text-sm p-4 bg-background"
                placeholder="Adicione uma descrição mais detalhada..."
              />
            </TabsContent>

            <TabsContent
              value="checklists"
              className="m-0 p-6 flex flex-col h-full gap-6 animate-fade-in"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Progresso
                  </h4>
                  <span className="text-sm font-medium text-muted-foreground">
                    {completedChecklists}/{totalChecklists} ({progressPercentage}%)
                  </span>
                </div>
                <Progress
                  aria-label="Progresso dos checklists"
                  value={progressPercentage}
                  className="h-2"
                />
              </div>

              <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="space-y-3 pb-4">
                  {task.checklists.map((chk) => (
                    <div
                      key={chk.id}
                      className={cn(
                        'flex flex-col p-3 rounded-lg transition-all border shadow-sm',
                        chk.completed
                          ? 'bg-muted/30 border-border/40'
                          : 'bg-background border-border hover:border-primary/50',
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={chk.id}
                          checked={chk.completed}
                          onCheckedChange={() => toggleChecklist(task.id, chk.id)}
                          aria-label={`Concluir item: ${chk.title}`}
                          className="mt-0.5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 h-5 w-5"
                        />
                        <div className="flex-1 space-y-1">
                          <label
                            htmlFor={chk.id}
                            className={cn(
                              'text-sm font-medium cursor-pointer block transition-all',
                              chk.completed
                                ? 'line-through text-muted-foreground'
                                : 'text-foreground',
                            )}
                          >
                            {chk.title}
                          </label>
                          {chk.completed && chk.completedAt && (
                            <p className="text-[11px] text-muted-foreground">
                              Concluído por <span className="font-semibold">{chk.completedBy}</span>{' '}
                              em {format(parseISO(chk.completedAt), "dd/MM 'às' HH:mm")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {task.checklists.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-xl border-border/60 bg-muted/10 transition-colors hover:bg-muted/30">
                      <ListTodo className="w-10 h-10 text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-medium text-foreground mb-1">Sem checklists</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Adicione itens para quebrar sua tarefa em passos menores.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('new-chk')?.focus()}
                        className="shadow-sm hover:scale-105 transition-transform"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Adicionar checklist
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <form
                onSubmit={handleAddChecklist}
                className="flex gap-2 mt-auto pt-2 border-t border-border/50"
              >
                <Input
                  id="new-chk"
                  aria-label="Título do novo checklist"
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  placeholder="Adicionar novo item..."
                  className="flex-1 focus-visible:ring-primary"
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Adicionar item"
                  disabled={!newChecklistTitle.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="historico" className="m-0 h-full flex flex-col p-6 animate-fade-in">
              <h4 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wide">
                Linha do Tempo
              </h4>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 pb-6">
                  {task.history.map((h, i) => (
                    <div key={h.id} className="relative pl-6">
                      <div
                        className="absolute left-[11px] top-6 bottom-[-1.5rem] w-px bg-border/80"
                        style={{ display: i === task.history.length - 1 ? 'none' : 'block' }}
                      />
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center z-10 shadow-sm">
                        {getHistoryIcon(h.action)}
                      </div>

                      <div className="bg-muted/30 p-3 rounded-lg border border-border/50 ml-2">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {h.performedBy}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {format(parseISO(h.performedAt), 'dd MMM, HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{h.description}</p>
                        {h.oldValue && h.newValue && (
                          <div className="mt-2 text-xs bg-background p-2 rounded border border-border flex flex-col gap-1">
                            <div className="flex items-start gap-2 text-muted-foreground line-through opacity-70">
                              <span className="font-semibold text-foreground/70 min-w-[40px]">
                                De:
                              </span>
                              <span className="line-clamp-2">{h.oldValue}</span>
                            </div>
                            <div className="flex items-start gap-2 text-foreground">
                              <span className="font-semibold min-w-[40px]">Para:</span>
                              <span className="line-clamp-2">{h.newValue}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
