import { TaskStatus } from '@/stores/useTaskStore'
import useTaskStore from '@/stores/useTaskStore'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function TaskSheet({
  taskId,
  open,
  onOpenChange,
}: {
  taskId: string | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { tasks, updateTaskStatus, toggleChecklist } = useTaskStore()
  const task = tasks.find((t) => t.id === taskId)

  if (!task) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full flex flex-col gap-6 p-6 md:p-8 bg-card border-l-0 shadow-[-10px_0_30px_rgba(0,0,0,0.1)]">
        <SheetHeader className="text-left">
          <div className="mb-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary w-fit uppercase tracking-wider">
            {task.priority === 'URGENT'
              ? 'Urgente'
              : task.priority === 'HIGH'
                ? 'Alta'
                : task.priority === 'MEDIUM'
                  ? 'Média'
                  : 'Baixa'}
          </div>
          <SheetTitle className="text-2xl font-bold leading-tight text-primary">
            {task.title}
          </SheetTitle>
          <SheetDescription className="text-base text-muted-foreground mt-2">
            {task.description}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 flex-1 overflow-hidden flex flex-col mt-2">
          <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/50">
            <span className="text-sm font-semibold text-foreground">Status Atual</span>
            <Select
              value={task.status}
              onValueChange={(v: TaskStatus) => updateTaskStatus(task.id, v)}
            >
              <SelectTrigger className="w-[180px] bg-background shadow-sm border-primary/20 focus:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">Pendente</SelectItem>
                <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                <SelectItem value="REVIEW">Aguardando Revisão</SelectItem>
                <SelectItem value="DONE">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {task.checklists.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-primary uppercase tracking-wide border-b border-border/50 pb-2">
                Checklist
              </h4>
              <div className="space-y-2.5 mt-3">
                {task.checklists.map((chk) => (
                  <div
                    key={chk.id}
                    className="flex items-center space-x-3 p-2 hover:bg-muted/40 rounded-md transition-colors"
                  >
                    <Checkbox
                      id={chk.id}
                      checked={chk.completed}
                      onCheckedChange={() => toggleChecklist(task.id, chk.id)}
                      className="border-primary/50 data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                    <label
                      htmlFor={chk.id}
                      className={`text-sm font-medium cursor-pointer flex-1 transition-all ${chk.completed ? 'line-through text-muted-foreground opacity-70' : 'text-foreground'}`}
                    >
                      {chk.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col pt-4 overflow-hidden border-t border-border/50">
            <h4 className="text-sm font-bold text-primary uppercase tracking-wide mb-4">
              Histórico da Tarefa
            </h4>
            <ScrollArea className="flex-1">
              <div className="space-y-5 pr-4 pb-6">
                {task.history.map((h, i) => (
                  <div key={h.id} className="relative pl-4">
                    <div
                      className="absolute left-0 top-1.5 bottom-[-1.25rem] w-px bg-border/80"
                      style={{ display: i === task.history.length - 1 ? 'none' : 'block' }}
                    ></div>
                    <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-primary/40 ring-4 ring-background"></div>

                    <p className="text-[11px] font-semibold text-muted-foreground mb-1">
                      {format(new Date(h.performedAt), "dd 'de' MMM, HH:mm", { locale: ptBR })} •{' '}
                      <span className="text-foreground">{h.performedBy}</span>
                    </p>
                    <p className="text-sm text-foreground/90 bg-muted/30 p-2.5 rounded-md border border-border/30 shadow-sm">
                      {h.description}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
