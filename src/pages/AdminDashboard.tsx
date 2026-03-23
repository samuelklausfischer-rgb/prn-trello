import { useState, useEffect } from 'react'
import { fetchAdminAnalytics, AdminAnalytics } from '@/lib/mock-analytics'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ExportButtons } from '@/components/dashboard/ExportButtons'
import { AdminCharts } from '@/components/dashboard/AdminCharts'
import { AdminTable } from '@/components/dashboard/AdminTable'
import DashboardSkeleton from '@/components/DashboardSkeleton'
import PageTransition from '@/components/PageTransition'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle, Clock, Target, Trophy, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const [data, setData] = useState<AdminAnalytics | null>(null)
  const [timeframe, setTimeframe] = useState('WEEK')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchAdminAnalytics(timeframe).then((res) => {
      if (mounted) {
        setData(res)
        setLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [timeframe])

  if (loading || !data) {
    return <DashboardSkeleton />
  }

  return (
    <PageTransition>
      <div className="space-y-8 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Dashboard Analítico
              </h1>
              <p className="text-muted-foreground font-medium">
                Monitore a produtividade e os KPIs globais da empresa.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger aria-label="Filtrar por período" className="w-[180px] bg-card">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAY">Hoje</SelectItem>
                <SelectItem value="WEEK">Esta Semana</SelectItem>
                <SelectItem value="MONTH">Este Mês</SelectItem>
                <SelectItem value="QUARTER">Este Trimestre</SelectItem>
              </SelectContent>
            </Select>
            <ExportButtons />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Tarefas Totais"
            value={data.kpis.totalTasks}
            icon={Target}
            colorClass="text-primary"
          />
          <MetricCard
            title="Atrasadas"
            value={data.kpis.overdue}
            icon={Clock}
            colorClass="text-destructive"
          />
          <MetricCard
            title="Taxa de Conclusão"
            value={`${data.kpis.completionRate}%`}
            icon={CheckCircle}
            colorClass="text-success"
          />
          <MetricCard
            title="Pontos Globais"
            value={data.kpis.totalPoints}
            icon={Trophy}
            colorClass="text-accent"
          />
        </div>

        <AdminCharts
          statusData={data.statusData}
          weeklyData={data.weeklyData}
          employeeData={data.employeeData}
        />

        <AdminTable performance={data.performance} />
      </div>
    </PageTransition>
  )
}
