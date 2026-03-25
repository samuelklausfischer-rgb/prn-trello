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
    low: 'bg-green-100/80 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300',
    medium:
      'bg-yellow-100/80 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300',
    high: 'bg-orange-100/80 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300',
    urgent: 'bg-red-100/80 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300',
  }

  const assignee = task.expand?.delegated_to

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'cursor-pointer hover-3d glass-card bg-background/80 dark:bg-background/40 border-white/20 dark:border-white/5',
        isDragging && 'opacity-50 scale-95 shadow-none',
        task.is_archived && 'opacity-60 bg-muted/30 grayscale-[0.3]',
      )}
    >
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <Badge
            variant="outline"
            className={cn('text-[10px] px-1.5 py-0 border', priorityColors[task.priority])}
          >
            {task.priority.toUpperCase()}
          </Badge>
          {task.points_reward > 0 && (
            <span className="text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-sm">
              +{task.points_reward} pts
            </span>
          )}
        </div>
        <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-2">
          {task.title}
        </h4>
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
            {task.is_archived && (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-background/50">
                Arquivada
              </Badge>
            )}
          </div>
          {assignee ? (
            <Avatar className="h-6 w-6 border border-border shadow-sm">
              <AvatarImage src={assignee.avatar} alt={assignee.name} />
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary to-accent text-white font-bold">
                {assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center border border-border">
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
