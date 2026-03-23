import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CalendarClock, CheckSquare, Trophy } from 'lucide-react'

interface EmployeeFeedsProps {
  recentTasks: any[]
  upcomingDeadlines: any[]
}

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  TODO: { label: 'A Fazer', variant: 'secondary' },
  IN_PROGRESS: { label: 'Em Progresso', variant: 'default' },
  DONE: { label: 'Concluído', variant: 'outline' },
}

export function EmployeeFeeds({ recentTasks, upcomingDeadlines }: EmployeeFeedsProps) {
  // Empty state for achievements as requested
  const achievements: any[] = []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="bg-muted/20 border-b pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckSquare className="w-5 h-5 text-primary" />
            Tarefas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <p className="font-semibold text-sm text-foreground line-clamp-1">{task.title}</p>
                <Badge
                  variant={statusMap[task.status]?.variant || 'outline'}
                  className="text-[10px]"
                >
                  {statusMap[task.status]?.label || task.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="bg-muted/20 border-b pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarClock className="w-5 h-5 text-destructive" />
            Próximos Prazos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {upcomingDeadlines.map((task) => (
              <div
                key={task.id}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <p className="font-semibold text-sm text-foreground line-clamp-1">{task.title}</p>
                <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                  {task.date}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm transition-shadow hover:shadow-md md:col-span-2 lg:col-span-1">
        <CardHeader className="bg-muted/20 border-b pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-accent" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center h-[240px]">
          {achievements.length > 0 ? (
            <div>List of achievements...</div>
          ) : (
            <div className="w-full flex flex-col items-center animate-fade-in">
              <div className="p-4 bg-muted rounded-full mb-3 ring-4 ring-background shadow-sm">
                <Trophy className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <h4 className="text-sm font-bold text-foreground mb-1">Sem conquistas ainda</h4>
              <p className="text-xs text-muted-foreground mb-6">
                Complete mais tarefas para desbloquear badges exclusivos.
              </p>

              <div className="w-full space-y-1.5 px-4">
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span className="uppercase tracking-wider">Próximo Nível</span>
                  <span>120/500 pts</span>
                </div>
                <Progress value={24} className="h-1.5" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
