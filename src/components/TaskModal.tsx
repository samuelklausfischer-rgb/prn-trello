import { useState, useEffect } from 'react'
import { TaskStatus } from '@/stores/useTaskStore'
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

export default function TaskModal({
  taskId,
  open,
  onOpenChange,
}: {
  taskId: string | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { tasks, updateTaskStatus, toggleChecklist, updateTaskDescription } = useTaskStore()
  const task = tasks.find((t) => t.id === taskId)

  const [desc, setDesc] = useState('')

  useEffect(() => {
    if (task) setDesc(task.description)
  }, [task?.id, task?.description])

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-4 border-b space-y-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
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
              <SelectTrigger className="w-[160px] h-8 text-xs bg-background">
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
              <TabsTrigger value="checklists">Checklists</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto bg-background">
            <TabsContent value="detalhes" className="m-0 h-full flex flex-col p-6">
              <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                Descrição da Tarefa
              </h4>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                onBlur={() => updateTaskDescription(task.id, desc)}
                className="flex-1 min-h-[250px] resize-none border-border/60 focus-visible:ring-1 shadow-sm text-sm p-4"
                placeholder="Adicione uma descrição mais detalhada..."
              />
            </TabsContent>

            <TabsContent value="checklists" className="m-0 p-6">
              <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                Itens de Verificação
              </h4>
              {task.checklists.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-12 border-2 border-dashed rounded-lg border-border/60">
                  Nenhum checklist para esta tarefa.
                </div>
              ) : (
                <div className="space-y-3">
                  {task.checklists.map((chk) => (
                    <div
                      key={chk.id}
                      className="flex items-center space-x-3 p-3 bg-muted/20 hover:bg-muted/50 rounded-lg transition-colors border border-border/50"
                    >
                      <Checkbox
                        id={chk.id}
                        checked={chk.completed}
                        onCheckedChange={() => toggleChecklist(task.id, chk.id)}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 h-5 w-5"
                      />
                      <label
                        htmlFor={chk.id}
                        className={`text-sm font-medium cursor-pointer flex-1 transition-all ${chk.completed ? 'line-through text-muted-foreground opacity-60' : 'text-foreground'}`}
                      >
                        {chk.title}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="historico" className="m-0 h-full flex flex-col p-6">
              <h4 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wide">
                Linha do Tempo
              </h4>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 pb-6">
                  {task.history.map((h, i) => (
                    <div key={h.id} className="relative pl-5">
                      <div
                        className="absolute left-0 top-2 bottom-[-1.5rem] w-px bg-border/80"
                        style={{ display: i === task.history.length - 1 ? 'none' : 'block' }}
                      ></div>
                      <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary/40 ring-4 ring-background"></div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                        {format(parseISO(h.performedAt), "dd 'de' MMM, HH:mm", { locale: ptBR })} •{' '}
                        <span className="text-foreground">{h.performedBy}</span>
                      </p>
                      <p className="text-sm text-foreground bg-muted/40 px-3 py-2 rounded-lg border border-border/40 shadow-sm inline-block max-w-[90%]">
                        {h.description}
                      </p>
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
