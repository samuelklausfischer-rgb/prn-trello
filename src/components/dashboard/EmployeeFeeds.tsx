import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarClock, CheckSquare } from 'lucide-react'

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="shadow-sm">
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

      <Card className="shadow-sm">
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
    </div>
  )
}
