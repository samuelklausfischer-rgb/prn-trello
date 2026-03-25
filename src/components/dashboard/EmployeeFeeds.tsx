import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarClock, CheckSquare, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskItem {
  id: string
  title: string
  status: string
  dueDate?: string
  priority?: string
}

interface EmployeeFeedsProps {
  recentTasks: TaskItem[]
  upcomingDeadlines: TaskItem[]
}

const statusMap: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  todo: { label: 'A Fazer', variant: 'secondary' },
  in_progress: { label: 'Em Progresso', variant: 'default' },
  review: { label: 'Em Revisão', variant: 'outline' },
  done: { label: 'Concluído', variant: 'outline' },
}

const priorityColor: Record<string, string> = {
  urgent: 'border-l-4 border-l-red-500',
  high: 'border-l-4 border-l-orange-500',
  medium: 'border-l-4 border-l-primary',
  low: 'border-l-4 border-l-slate-300',
}

export function EmployeeFeeds({ recentTasks, upcomingDeadlines }: EmployeeFeedsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      <Card className="glass-card border-white/20 dark:border-white/10 flex flex-col">
        <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckSquare className="w-5 h-5 text-primary drop-shadow-sm" />
            Tarefas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          <div className="divide-y divide-border/50">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'p-4 flex items-center justify-between hover:bg-background/50 transition-colors cursor-pointer',
                  task.priority ? priorityColor[task.priority] : '',
                )}
              >
                <div className="min-w-0 flex-1 pr-4">
                  <p className="font-semibold text-sm text-foreground line-clamp-1">{task.title}</p>
                </div>
                <Badge
                  variant={statusMap[task.status]?.variant || 'outline'}
                  className={cn(
                    'text-[10px] whitespace-nowrap font-bold',
                    task.status === 'done' && 'border-accent text-accent bg-accent/10',
                  )}
                >
                  {statusMap[task.status]?.label || task.status}
                </Badge>
              </div>
            ))}
            {recentTasks.length === 0 && (
              <div className="p-6 text-center text-muted-foreground text-sm font-medium">
                Nenhuma tarefa recente.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/20 dark:border-white/10 flex flex-col">
        <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarClock className="w-5 h-5 text-accent drop-shadow-sm" />
            Próximos Prazos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          <div className="divide-y divide-border/50">
            {upcomingDeadlines.map((task) => {
              const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false
              return (
                <div
                  key={task.id}
                  className="p-4 flex flex-col gap-2 hover:bg-background/50 transition-colors cursor-pointer"
                >
                  <p className="font-semibold text-sm text-foreground line-clamp-1">{task.title}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <Clock
                        className={cn(
                          'w-3.5 h-3.5',
                          isOverdue ? 'text-destructive' : 'text-primary',
                        )}
                      />
                      <span className={cn(isOverdue ? 'text-destructive' : 'text-foreground/80')}>
                        {task.dueDate}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-background/50 font-bold border-white/20"
                    >
                      {statusMap[task.status]?.label || task.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
            {upcomingDeadlines.length === 0 && (
              <div className="p-6 text-center text-muted-foreground text-sm font-medium">
                Nenhum prazo próximo.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
