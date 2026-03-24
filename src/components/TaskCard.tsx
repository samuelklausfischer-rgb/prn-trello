import { TaskRecord } from '@/services/tasks'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default function TaskCard({
  task,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: TaskRecord
  onClick: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: (e: React.DragEvent) => void
  isDragging?: boolean
}) {
  const priorityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  }

  const assignee = task.expand?.delegated_to

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'cursor-pointer hover:shadow-md transition-shadow border-border/60',
        isDragging && 'opacity-50 scale-95',
        task.is_archived && 'opacity-60 bg-muted/50',
      )}
    >
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <Badge
            variant="outline"
            className={cn('text-[10px] px-1.5 py-0 border-0', priorityColors[task.priority])}
          >
            {task.priority.toUpperCase()}
          </Badge>
          {task.points_reward > 0 && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded-md whitespace-nowrap">
              +{task.points_reward} pts
            </span>
          )}
        </div>
        <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-2">
          {task.title}
        </h4>
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
            {task.is_archived && (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                Arquivada
              </Badge>
            )}
          </div>
          {assignee ? (
            <Avatar className="h-6 w-6 border border-border shadow-sm">
              <AvatarImage src={assignee.avatar} alt={assignee.name} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                {assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center border border-border">
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
