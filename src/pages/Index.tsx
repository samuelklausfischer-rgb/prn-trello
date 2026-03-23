import useAuthStore from '@/stores/useAuthStore'
import useTaskStore from '@/stores/useTaskStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, CheckCircle, Target, Clock, Activity, Flag } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Index() {
  const { user } = useAuthStore()
  const { tasks } = useTaskStore()

  if (!user) return null

  const completedTasks = tasks.filter((t) => t.status === 'DONE').length
  const pendingTasks = tasks.filter((t) => t.status === 'TODO').length
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length

  const allHistory = tasks
    .flatMap((t) => t.history.map((h) => ({ ...h, taskTitle: t.title })))
    .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
    .slice(0, 5)

  const progressToNext = ((user.points % 500) / 500) * 100

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-primary p-8 rounded-2xl text-white shadow-elevation relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-accent/20 to-transparent"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Olá, {user.name}!</h1>
          <p className="text-primary-foreground/90 text-lg font-medium">
            Você está no nível {user.level}. Continue o bom trabalho!
          </p>
        </div>
        <div className="relative z-10 mt-6 md:mt-0 flex items-center gap-4 bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
          <Trophy className="w-12 h-12 text-accent" />
          <div>
            <p className="text-sm text-primary-foreground/80 font-medium">Pontos Totais</p>
            <p className="text-2xl font-bold">{user.points}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-accent shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">
              Desempenho Semanal
            </CardTitle>
            <Activity className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {user.points} <span className="text-base font-medium text-muted-foreground">pts</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">
              Tarefas Concluídas
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-success">{completedTasks}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">
              Rumo ao Nível {user.level + 1}
            </CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3 mt-1">
            <div className="text-2xl font-bold text-primary tracking-tight">
              {user.points % 500}{' '}
              <span className="text-sm text-muted-foreground font-medium">/ 500 pts</span>
            </div>
            <Progress value={progressToNext} className="h-2.5" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <Flag className="w-5 h-5 text-accent" /> Visão Geral de Tarefas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-card shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
                <CardTitle className="text-sm font-bold text-muted-foreground">Pendentes</CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-4 flex items-baseline gap-2">
                <p className="text-3xl font-bold text-foreground">{pendingTasks}</p>
                <span className="text-xs text-muted-foreground font-medium">tarefas</span>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
                <CardTitle className="text-sm font-bold text-muted-foreground">
                  Em Andamento
                </CardTitle>
                <Activity className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent className="pt-4 flex items-baseline gap-2">
                <p className="text-3xl font-bold text-foreground">{inProgressTasks}</p>
                <span className="text-xs text-muted-foreground font-medium">tarefas</span>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-primary">Atividade Recente</h2>
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {allHistory.map((item, i) => (
                  <div key={i} className="p-4 hover:bg-muted/30 transition-colors">
                    <p className="text-sm font-semibold text-foreground line-clamp-1 mb-1">
                      {item.taskTitle}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium">
                      <span>{item.performedBy}</span>
                      <span>
                        {format(new Date(item.performedAt), 'dd MMM, HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
