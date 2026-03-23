import { Task } from '@/stores/useTaskStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, isPast, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckSquare, Clock, ArrowRight, AlertCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default function TaskCard({
  task,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: Task
  onClick: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: (e: React.DragEvent) => void
  isDragging?: boolean
}) {
  const priorityConfig = {
    LOW: {
      label: 'BAIXA',
      color:
        'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
    },
    MEDIUM: {
      label: 'MÉDIA',
      color:
        'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800',
    },
    HIGH: {
      label: 'ALTA',
      color:
        'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
    },
    URGENT: {
      label: 'URGENTE',
      color:
        'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
    },
  }

  const completedChecks = task.checklists.filter((c) => c.completed).length
  const totalChecks = task.checklists.length
  const hasPendingChecks = totalChecks > 0 && completedChecks < totalChecks
  const isHighPriority = task.priority === 'HIGH' || task.priority === 'URGENT'

  const showChecklistAlert = hasPendingChecks && isHighPriority

  const isTaskOverdue = task.dueDate
    ? isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate))
    : false

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Tarefa: ${task.title}`}
      className={cn(
        'cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none transition-all duration-200 border-border/60 relative overflow-hidden bg-card',
        isDragging && 'opacity-50 scale-[0.98] shadow-sm',
      )}
    >
      {showChecklistAlert && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[30px] border-t-orange-500 border-l-[30px] border-l-transparent z-10" />
      )}

      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2 relative z-20">
          <Badge
            variant="outline"
            className={cn('text-[10px] px-1.5 py-0 border', priorityConfig[task.priority].color)}
          >
            {priorityConfig[task.priority].label}
          </Badge>
          {showChecklistAlert && (
            <AlertCircle className="w-3.5 h-3.5 text-white absolute -top-1 -right-1" />
          )}
        </div>

        <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-2">
          {task.title}
        </h4>

        <div className="flex flex-wrap items-center gap-2 mt-1">
          {task.dueDate && (
            <div
              className={cn(
                'flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium border',
                isTaskOverdue
                  ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50'
                  : 'bg-muted text-muted-foreground border-border',
              )}
            >
              <Clock className="w-3 h-3" />
              {format(parseISO(task.dueDate), 'dd MMM', { locale: ptBR })}
            </div>
          )}
          {totalChecks > 0 && (
            <div
              className={cn(
                'flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md border',
                completedChecks === totalChecks
                  ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-900/50'
                  : showChecklistAlert
                    ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900/50'
                    : 'bg-muted text-muted-foreground border-border',
              )}
            >
              <CheckSquare className="w-3 h-3" />
              {completedChecks}/{totalChecks}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-1 pt-3 border-t border-border/50">
          {task.delegator && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <ArrowRight className="w-3.5 h-3.5 text-primary/60" />
              <span className="truncate max-w-[120px]">{task.delegator}</span>
            </div>
          )}
          {task.assignee && (
            <Avatar className="h-6 w-6 border border-border ml-auto shadow-sm">
              <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                {task.assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
