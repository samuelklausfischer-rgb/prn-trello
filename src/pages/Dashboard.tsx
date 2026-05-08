import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'
import { useRealtime } from '@/hooks/use-realtime'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ExportButtons } from '@/components/dashboard/ExportButtons'
import { EmployeeCharts } from '@/components/dashboard/EmployeeCharts'
import { EmployeeFeeds } from '@/components/dashboard/EmployeeFeeds'
import { NotificationsWidget } from '@/components/dashboard/NotificationsWidget'
import { getUnreadNotifications } from '@/services/notifications'
import DashboardSkeleton from '@/components/DashboardSkeleton'
import PageTransition from '@/components/PageTransition'
import { GuideTour, useTour } from '@/components/GuideTour'
import { Target, CheckCircle, Trophy, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { getUserStats } from '@/services/views'
import { getLevels } from '@/services/gamification'

interface DashboardData {
  stats: {
    totalTasks: number
    completed: number
    completionRate: number
    points: number
    levelName: string
  }
  productivityData: any[]
  progressData: any[]
  teamComparison: any[]
  recentTasks: any[]
  upcomingDeadlines: any[]
  unreadNotifications: any[]
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})
const dayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })

export default function Dashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)

  const { open: tourOpen, closeTour } = useTour('dashboard')
  const tourSteps = [
    {
      target: '[data-tour="dash-summary"]',
      title: 'Resumo do Desempenho',
      content:
        'Bem-vindo ao seu painel principal! Aqui você vê um resumo rápido do seu nível, pontos e opções de exportação de dados.',
      placement: 'bottom' as const,
    },
    {
      target: '[data-tour="dash-metrics"]',
      title: 'Indicadores Chave',
      content:
        'Estes cards mostram suas tarefas totais, concluídas e sua taxa de conclusão atual. As cores indicam seu progresso.',
      placement: 'bottom' as const,
    },
    {
      target: '[data-tour="dash-charts"]',
      title: 'Análise de Produtividade',
      content:
        'Acompanhe seu fluxo de trabalho dos últimos 7 dias e compare sua pontuação com a média da equipe.',
      placement: 'top' as const,
    },
    {
      target: '[data-tour="dash-notifications"]',
      title: 'Centro de Notificações',
      content:
        'Avisos importantes sobre prazos, atribuições e desempenho aparecerão aqui. Fique atento!',
      placement: 'left' as const,
    },
  ]
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user?.id) return

    try {
      const [tasks, allUsers, levelsList, userStats, unreadNotifications] = await Promise.all([
        pb.collection('tasks').getFullList({
          filter: `created_by = '${user.id}' || delegated_to = '${user.id}'`,
          sort: '-updated',
        }),
        pb.collection('users').getFullList({ filter: 'is_active = true' }),
        getLevels().catch(() => []),
        getUserStats(user.id).catch(() => null),
        getUnreadNotifications(user.id).catch(() => []),
      ])

      const completedTasks = tasks.filter((t) => t.status === 'done')
      const totalTasks = userStats ? userStats.total_tasks : tasks.length
      const completedCount = userStats ? userStats.completed_tasks : completedTasks.length
      const completionRate = userStats
        ? userStats.completion_rate
        : totalTasks > 0
          ? Math.round((completedCount / totalTasks) * 100)
          : 0

      const currentUserData = await pb
        .collection('users')
        .getOne(user.id)
        .catch(() => user)
      const currentLevelObj = levelsList.find((l) => l.level_number === currentUserData.level) || {
        level_number: currentUserData.level || 1,
        name: `Nível ${currentUserData.level || 1}`,
        min_xp: 0,
        max_xp: 500,
      }

      const teamAvgPoints =
        allUsers.length > 0
          ? Math.round(allUsers.reduce((acc, u) => acc + (u.points || 0), 0) / allUsers.length)
          : 0

      const progressData = [
        { name: 'Concluído', value: completedCount, key: 'done' },
        {
          name: 'Em Progresso',
          value: tasks.filter((t) => t.status === 'in_progress').length,
          key: 'inProgress',
        },
        { name: 'A Fazer', value: tasks.filter((t) => t.status === 'todo').length, key: 'todo' },
      ].filter((d) => d.value > 0)

      const today = new Date()
      today.setHours(23, 59, 59, 999)
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today)
        d.setDate(d.getDate() - (6 - i))
        return {
          dateStr: d.toISOString().split('T')[0],
          day: dayFormatter.format(d).replace('.', ''),
          tasks: 0,
        }
      })

      completedTasks.forEach((t) => {
        const dt = t.completed_at ? new Date(t.completed_at) : new Date(t.updated)
        const dateStr = dt.toISOString().split('T')[0]
        const match = last7Days.find((d) => d.dateStr === dateStr)
        if (match) match.tasks++
      })

      const recentTasks = tasks.slice(0, 5).map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
      }))

      const upcomingDeadlines = tasks
        .filter((t) => t.due_date && t.status !== 'done' && new Date(t.due_date) >= new Date())
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
        .slice(0, 4)
        .map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          dueDate: dateFormatter.format(new Date(t.due_date!)),
        }))

      setData({
        stats: {
          totalTasks,
          completed: completedCount,
          completionRate,
          points: userStats?.points ?? currentUserData.points ?? 0,
          levelName: currentLevelObj.name,
        },
        productivityData: last7Days,
        progressData,
        teamComparison: [
          { name: 'Você', value: userStats?.points ?? currentUserData.points ?? 0, type: 'user' },
          { name: 'Média da Equipe', value: teamAvgPoints, type: 'team' },
        ],
        recentTasks,
        upcomingDeadlines,
        unreadNotifications,
      })
    } catch (error) {
      console.error('Failed to load dashboard data', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    let mounted = true
    if (mounted) {
      setLoading(true)
      loadData()
    }
    return () => {
      mounted = false
    }
  }, [loadData])

  useRealtime('tasks', () => {
    loadData()
  })
  useRealtime('users', () => {
    loadData()
  })
  useRealtime('notifications', (e) => {
    if (e.record.user === user?.id) {
      if (e.action === 'create' && !e.record.is_read) {
        toast.info(e.record.title, { description: e.record.message })
      }
      loadData()
    }
  })

  if (!user) return null

  if (loading || !data) {
    return <DashboardSkeleton />
  }

  return (
    <PageTransition>
      <div className="space-y-8 pb-8">
        <GuideTour
          steps={tourSteps}
          open={tourOpen}
          onClose={closeTour}
          estimatedTime="2 minutos"
        />
        <div
          data-tour="dash-summary"
          className="bg-gradient-to-r from-primary/80 to-accent/80 dark:from-primary/20 dark:to-accent/20 glass-card p-8 rounded-3xl text-white dark:text-foreground relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between transition-colors duration-300 stagger-item stagger-1"
        >
          <div className="absolute inset-0 bg-white/10 dark:bg-black/20 pointer-events-none backdrop-blur-md"></div>
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-md">
              Bem-vindo(a) de volta, {user.name.split(' ')[0]}!
            </h1>
            <p className="text-white/90 dark:text-muted-foreground text-lg font-medium drop-shadow-sm">
              Aqui está o resumo do seu desempenho na PRN Organizador.
            </p>
          </div>
          <div className="relative z-10 mt-6 md:mt-0">
            <ExportButtons />
          </div>
        </div>

        <div
          data-tour="dash-metrics"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-item stagger-2"
        >
          <MetricCard
            title="Minhas Tarefas"
            value={data.stats.totalTasks}
            icon={Target}
            colorClass="text-primary dark:text-primary"
          />
          <MetricCard
            title="Concluídas"
            value={data.stats.completed}
            icon={CheckCircle}
            colorClass="text-success"
          />
          <MetricCard
            title="Taxa de Conclusão"
            value={`${data.stats.completionRate}%`}
            icon={BarChart3}
            colorClass="text-primary"
          />
          <MetricCard
            title="Meus Pontos"
            value={data.stats.points}
            icon={Trophy}
            colorClass="text-accent"
            subtitle={data.stats.levelName}
          />
        </div>

        <div data-tour="dash-charts" className="stagger-item stagger-3">
          <EmployeeCharts
            productivityData={data.productivityData}
            progressData={data.progressData}
            teamComparison={data.teamComparison}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-item stagger-4">
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            <EmployeeFeeds
              recentTasks={data.recentTasks}
              upcomingDeadlines={data.upcomingDeadlines}
            />
          </div>
          <div className="space-y-6 lg:col-span-1 h-full flex flex-col">
            <div data-tour="dash-notifications">
              <NotificationsWidget notifications={data.unreadNotifications} onRefresh={loadData} />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
