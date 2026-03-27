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
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { isPast, differenceInHours, differenceInDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function TaskCard({
  task,
  checklists = [],
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
  isAdmin,
  users = [],
  onDelegate,
}: {
  task: TaskRecord
  checklists?: ChecklistRecord[]
  onClick: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: (e: React.DragEvent) => void
  isDragging?: boolean
  isAdmin?: boolean
  users?: any[]
  onDelegate?: (taskId: string, userId: string) => void
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

  const AssigneeAvatar = () =>
    assignee ? (
      <Avatar className="h-7 w-7 border-2 border-background shadow-md">
        <AvatarImage src={assignee.avatar} alt={assignee.name} />
        <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary to-accent text-white font-bold">
          {assignee.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
    ) : (
      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center border-2 border-background shadow-sm hover:bg-muted/80 transition-colors">
        <User className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    )

  const dueDate = task.due_date ? new Date(task.due_date) : null
  const now = new Date()
  const isDone = task.status === 'done'
  const isPastDue = dueDate && isPast(dueDate)

  const isCriticalOverdue = isPastDue && !isDone && task.deadline_type === 'mandatory'
  const isOptionalOverdue = isPastDue && !isDone && task.deadline_type === 'optional'
  const hoursToDeadline = dueDate ? differenceInHours(dueDate, now) : null
  const isNearDeadline =
    dueDate && !isPastDue && !isDone && hoursToDeadline !== null && hoursToDeadline <= 24

  let timeLabel = ''
  if (dueDate && !isDone) {
    const diffDays = Math.abs(differenceInDays(now, dueDate))
    const diffHours = Math.abs(differenceInHours(now, dueDate)) % 24

    if (isPastDue) {
      timeLabel =
        diffDays > 0 ? `Atrasado há ${diffDays}d ${diffHours}h` : `Atrasado há ${diffHours}h`
    } else {
      timeLabel = diffDays > 0 ? `Faltam ${diffDays}d ${diffHours}h` : `Faltam ${diffHours}h`
    }
  } else if (isDone && task.completed_at) {
    timeLabel = `Concluído em ${format(new Date(task.completed_at), 'dd/MM HH:mm')}`
  } else if (isDone) {
    timeLabel = `Concluído`
  }

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'cursor-pointer hover-3d premium-task-card !rounded-3xl relative',
        isDragging && 'opacity-50 scale-95 shadow-none',
        task.is_archived && 'opacity-60 bg-muted/30 grayscale-[0.3]',
      )}
    >
      <CardContent className="p-5 flex flex-col gap-3.5">
        <div className="flex justify-between items-start gap-2">
          <div className="flex gap-1.5 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] px-2 py-0.5 border font-bold tracking-wide',
                priorityColors[task.priority],
              )}
            >
              {task.priority.toUpperCase()}
            </Badge>
            {isCriticalOverdue && (
              <Badge
                variant="destructive"
                className="text-[10px] uppercase font-bold animate-pulse px-2 py-0.5"
              >
                <AlertTriangle className="w-3 h-3 mr-1" /> Atrasada
              </Badge>
            )}
            {isOptionalOverdue && (
              <Badge
                variant="secondary"
                className="bg-muted/80 text-muted-foreground border-transparent text-[10px] uppercase font-bold px-2 py-0.5"
              >
                <Clock className="w-3 h-3 mr-1" /> Expirada
              </Badge>
            )}
            {isNearDeadline && !isCriticalOverdue && !isOptionalOverdue && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] uppercase font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)] px-2 py-0.5 border-none">
                <Clock className="w-3 h-3 mr-1" /> Vence em breve
              </Badge>
            )}
          </div>
          <div className="flex gap-1.5 items-center">
            {task.is_private && (
              <span className="text-[9px] font-bold text-muted-foreground bg-muted border border-border/50 px-1.5 py-0.5 rounded-md">
                PRIVADA
              </span>
            )}
            {task.points_reward > 0 && (
              <span className="text-[11px] font-black text-white bg-gradient-to-br from-primary to-accent border border-white/20 px-2.5 py-0.5 rounded-lg whitespace-nowrap shadow-[0_0_12px_rgba(161,0,255,0.6)]">
                +{task.points_reward} pts
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2.5 mt-1">
          <div className="mt-0.5 p-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(0,212,255,0.2)] shrink-0">
            <TaskIcon className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <h4 className="font-semibold text-[15px] leading-tight text-foreground line-clamp-2 pt-0.5">
              {task.title}
            </h4>

            <div
              className={cn(
                'flex items-center gap-1.5 text-xs mt-1 p-1.5 rounded-lg border w-fit',
                isCriticalOverdue
                  ? 'bg-destructive/10 text-destructive border-destructive/20'
                  : isNearDeadline
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
                    : isOptionalOverdue
                      ? 'bg-muted/80 text-muted-foreground border-transparent'
                      : isDone
                        ? 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400'
                        : 'bg-muted/50 text-muted-foreground border-transparent',
              )}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              {dueDate || isDone ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {dueDate && (
                    <span className="font-medium">
                      {format(dueDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  )}
                  {task.deadline_type === 'mandatory' && !isDone && dueDate && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-background/50 text-current">
                      Obrigatório
                    </span>
                  )}
                  {task.deadline_type === 'optional' && !isDone && dueDate && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-background/50 text-current">
                      Opcional
                    </span>
                  )}
                  {timeLabel && (
                    <span className="text-[10.5px] font-bold opacity-90 tracking-wide">
                      ({timeLabel})
                    </span>
                  )}
                </div>
              ) : (
                <span className="font-medium">Sem Prazo</span>
              )}
            </div>
          </div>
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
          {isAdmin && !task.is_private ? (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none focus-visible:ring-2 ring-primary rounded-full hover:scale-110 transition-transform">
                  <AssigneeAvatar />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 glass-card border-white/10 rounded-xl p-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold px-2">
                    Delegação Ágil
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem
                    onClick={() => onDelegate?.(task.id, '')}
                    className="cursor-pointer text-xs font-medium focus:bg-primary/20 rounded-md"
                  >
                    <User className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Sem responsável
                  </DropdownMenuItem>
                  {users
                    ?.filter((u) => u.role?.toLowerCase() === 'employee')
                    .map((u) => (
                      <DropdownMenuItem
                        key={u.id}
                        onClick={() => onDelegate?.(task.id, u.id)}
                        className="cursor-pointer text-xs font-medium focus:bg-primary/20 rounded-md"
                      >
                        <Avatar className="w-4 h-4 mr-2 border border-border">
                          <AvatarImage src={u.avatar} />
                          <AvatarFallback className="text-[8px] bg-primary text-white font-bold">
                            {u.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{u.name}</span>
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <AssigneeAvatar />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
