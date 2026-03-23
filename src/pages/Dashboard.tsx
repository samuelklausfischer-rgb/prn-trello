import { useState, useEffect } from 'react'
import useAuthStore from '@/stores/useAuthStore'
import { fetchUserAnalytics, UserAnalytics } from '@/lib/mock-analytics'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ExportButtons } from '@/components/dashboard/ExportButtons'
import { EmployeeCharts } from '@/components/dashboard/EmployeeCharts'
import { EmployeeFeeds } from '@/components/dashboard/EmployeeFeeds'
import DashboardSkeleton from '@/components/DashboardSkeleton'
import PageTransition from '@/components/PageTransition'
import { Target, CheckCircle, Trophy, BarChart3 } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState<UserAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    if (user?.id) {
      setLoading(true)
      fetchUserAnalytics(user.id).then((res) => {
        if (mounted) {
          setData(res)
          setLoading(false)
        }
      })
    }
    return () => {
      mounted = false
    }
  }, [user?.id])

  if (!user) return null

  if (loading || !data) {
    return <DashboardSkeleton />
  }

  return (
    <PageTransition>
      <div className="space-y-8 pb-8">
        <div className="bg-primary p-8 rounded-2xl text-primary-foreground shadow-elevation relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-accent/20 to-transparent pointer-events-none"></div>
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Bem-vindo(a) de volta, {user.name.split(' ')[0]}!
            </h1>
            <p className="text-primary-foreground/90 text-lg font-medium">
              Aqui está o resumo do seu desempenho e tarefas pendentes.
            </p>
          </div>
          <div className="relative z-10 mt-6 md:mt-0">
            <ExportButtons />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Minhas Tarefas"
            value={data.kpis.totalTasks}
            icon={Target}
            colorClass="text-primary"
          />
          <MetricCard
            title="Concluídas"
            value={data.kpis.completed}
            icon={CheckCircle}
            colorClass="text-success"
          />
          <MetricCard
            title="Taxa de Conclusão"
            value={`${data.kpis.completionRate}%`}
            icon={BarChart3}
            colorClass="text-blue-500"
          />
          <MetricCard
            title="Meus Pontos"
            value={data.kpis.points}
            icon={Trophy}
            colorClass="text-accent"
            subtitle={`Nível ${user.level}`}
          />
        </div>

        <EmployeeCharts
          productivityData={data.productivityData}
          progressData={data.progressData}
          teamComparison={data.teamComparison}
        />

        <EmployeeFeeds recentTasks={data.recentTasks} upcomingDeadlines={data.upcomingDeadlines} />
      </div>
    </PageTransition>
  )
}
