import { Task } from '@/stores/useTaskStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckSquare, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const priorityColors = {
    LOW: 'bg-secondary text-secondary-foreground',
    MEDIUM: 'bg-success/15 text-success border-success/30',
    HIGH: 'bg-warning/15 text-yellow-700 border-warning/30',
    URGENT: 'bg-destructive/15 text-destructive border-destructive/30',
  }

  const completedChecks = task.checklists.filter((c) => c.completed).length
  const totalChecks = task.checklists.length

  return (
    <Card
      className="cursor-pointer hover:shadow-elevation transition-all active:scale-[0.98] border-border/60 animate-fade-in-up"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-semibold text-[15px] leading-tight text-foreground line-clamp-2">
            {task.title}
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
          <Badge
            variant="outline"
            className={cn('text-[10px] px-1.5 py-0 border', priorityColors[task.priority])}
          >
            {task.priority === 'LOW'
              ? 'BAIXA'
              : task.priority === 'MEDIUM'
                ? 'MÉDIA'
                : task.priority === 'HIGH'
                  ? 'ALTA'
                  : 'URGENTE'}
          </Badge>

          {task.dueDate && (
            <div className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded-md">
              <Clock className="w-3 h-3" />
              {format(new Date(task.dueDate), 'dd/MM', { locale: ptBR })}
            </div>
          )}

          {totalChecks > 0 && (
            <div
              className={cn(
                'flex items-center gap-1 ml-auto',
                completedChecks === totalChecks ? 'text-success' : '',
              )}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              {completedChecks}/{totalChecks}
            </div>
          )}
        </div>

        {task.delegatedTo && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
              {task.delegatedTo.charAt(0)}
            </div>
            <span className="truncate">{task.delegatedTo}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
