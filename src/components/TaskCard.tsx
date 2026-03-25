import { TaskRecord } from '@/services/tasks'
import { ChecklistRecord } from '@/services/checklists'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User,
  MessageCircle,
  Network,
  Zap,
  FileText,
  CheckCircle2,
  Circle,
  ChevronDown,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default function TaskCard({
  task,
  checklists = [],
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: TaskRecord
  checklists?: ChecklistRecord[]
  onClick: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: (e: React.DragEvent) => void
  isDragging?: boolean
}) {
  const priorityColors: Record<string, string> = {
    low: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30',
    medium:
      'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50 shadow-[0_0_12px_rgba(234,179,8,0.4)]',
    high: 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.4)]',
    urgent:
      'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]',
  }

  const assignee = task.expand?.delegated_to

  const getContextIcon = () => {
    const title = task.title.toLowerCase()
    if (title.includes('whatsapp') || title.includes('wpp')) return MessageCircle
    if (title.includes('fluxograma') || title.includes('processo')) return Network
    if (title.includes('disparador') || title.includes('autom')) return Zap
    return FileText
  }
  const TaskIcon = getContextIcon()

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'cursor-pointer hover-3d premium-task-card !rounded-3xl',
        isDragging && 'opacity-50 scale-95 shadow-none',
        task.is_archived && 'opacity-60 bg-muted/30 grayscale-[0.3]',
      )}
    >
      <CardContent className="p-5 flex flex-col gap-3.5">
        <div className="flex justify-between items-start gap-2">
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] px-2 py-0.5 border font-bold tracking-wide',
              priorityColors[task.priority],
            )}
          >
            {task.priority.toUpperCase()}
          </Badge>
          {task.points_reward > 0 && (
            <span className="text-[11px] font-black text-white bg-gradient-to-br from-primary to-accent border border-white/20 px-2.5 py-0.5 rounded-lg whitespace-nowrap shadow-[0_0_12px_rgba(161,0,255,0.6)]">
              +{task.points_reward} pts
            </span>
          )}
        </div>

        <div className="flex items-start gap-2.5 mt-1">
          <div className="mt-0.5 p-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(0,212,255,0.2)] shrink-0">
            <TaskIcon className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-[15px] leading-tight text-foreground line-clamp-2 pt-0.5">
            {task.title}
          </h4>
        </div>

        {checklists.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1 bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-border/40">
            {checklists.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-start gap-2">
                {item.is_completed ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-[2px] drop-shadow-[0_0_5px_rgba(0,212,255,0.5)]" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-[2px]" />
                )}
                <span
                  className={cn(
                    'text-xs leading-tight text-muted-foreground',
                    item.is_completed && 'line-through opacity-60',
                  )}
                >
                  {item.title}
                </span>
              </div>
            ))}
            {checklists.length > 3 && (
              <div className="mt-2 flex justify-center">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-accent bg-accent/10 border border-accent/30 px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(161,0,255,0.2)] transition-transform hover:scale-105">
                  Mostrar mais (+{checklists.length - 3}) <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-1 pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
            {task.is_archived && (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-background/50">
                Arquivada
              </Badge>
            )}
          </div>
          {assignee ? (
            <Avatar className="h-7 w-7 border-2 border-background shadow-md">
              <AvatarImage src={assignee.avatar} alt={assignee.name} />
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary to-accent text-white font-bold">
                {assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center border-2 border-background shadow-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
