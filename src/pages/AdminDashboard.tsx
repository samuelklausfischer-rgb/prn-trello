import { useState, useEffect, useMemo } from 'react'
import pb from '@/lib/pocketbase/client'
import { startOfDay, startOfWeek, startOfMonth, startOfQuarter, format } from 'date-fns'
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
import { CheckCircle, Clock, Target, Trophy, Activity, AlertCircle } from 'lucide-react'

export default function AdminDashboard() {
  const [tasks, setTasks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [timeframe, setTimeframe] = useState('WEEK')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    const fetchData = async () => {
      try {
        const now = new Date()
        let dateStart
        switch (timeframe) {
          case 'TODAY':
            dateStart = startOfDay(now)
            break
          case 'WEEK':
            dateStart = startOfWeek(now, { weekStartsOn: 1 })
            break
          case 'MONTH':
            dateStart = startOfMonth(now)
            break
          case 'QUARTER':
            dateStart = startOfQuarter(now)
            break
          default:
            dateStart = startOfWeek(now, { weekStartsOn: 1 })
        }

        const dateStr = dateStart.toISOString().replace('T', ' ')

        const [fetchedTasks, fetchedUsers] = await Promise.all([
          pb.collection('tasks').getFullList({
            filter: `created >= "${dateStr}"`,
            expand: 'delegated_to',
          }),
          pb.collection('users').getFullList(),
        ])

        if (mounted) {
          setTasks(fetchedTasks)
          setUsers(fetchedUsers)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        if (mounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [timeframe])

  const { kpis, statusData, weeklyData, employeeData, performance } = useMemo(() => {
    const defaultKpis = { totalTasks: 0, overdue: 0, completionRate: 0, totalPoints: 0 }

    if (!tasks.length && !users.length && !loading) {
      return {
        kpis: defaultKpis,
        statusData: [],
        weeklyData: [],
        employeeData: [],
        performance: [],
      }
    }

    const totalTasks = tasks.length
    const overdueTasks = tasks.filter(
      (t) => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date(),
    )
    const completedTasks = tasks.filter((t) => t.status === 'done')
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0
    const totalPoints = completedTasks.reduce((acc, t) => acc + (t.points_reward || 0), 0)

    const statusCount = { todo: 0, in_progress: 0, review: 0, done: 0 }
    tasks.forEach((t) => {
      if (t.status in statusCount) {
        statusCount[t.status as keyof typeof statusCount]++
      }
    })

    const statusData = [
      { name: 'A Fazer', value: statusCount.todo, key: 'todo' },
      { name: 'Em Progresso', value: statusCount.in_progress, key: 'inProgress' },
      { name: 'Em Revisão', value: statusCount.review, key: 'review' },
      { name: 'Concluído', value: statusCount.done, key: 'done' },
    ].filter((d) => d.value > 0)

    const daysMap: Record<string, { label: string; count: number; date: Date }> = {}
    tasks.forEach((t) => {
      const dateStr = t.status === 'done' && t.completed_at ? t.completed_at : t.created
      if (dateStr) {
        const date = new Date(dateStr)
        const key = format(date, 'yyyy-MM-dd')
        if (!daysMap[key]) {
          daysMap[key] = { label: format(date, 'dd/MM'), count: 0, date }
        }
        daysMap[key].count++
      }
    })

    const weeklyData = Object.values(daysMap)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((item) => ({ day: item.label, tasks: item.count }))

    const userStats: Record<
      string,
      { id: string; name: string; total: number; completed: number }
    > = {}
    users.forEach((u) => {
      userStats[u.id] = { id: u.id, name: u.name || 'Sem nome', total: 0, completed: 0 }
    })

    tasks.forEach((t) => {
      const userId = t.delegated_to
      if (userId && userStats[userId]) {
        userStats[userId].total++
        if (t.status === 'done') {
          userStats[userId].completed++
        }
      }
    })

    const employeeData = Object.values(userStats)
      .filter((u) => u.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((u) => ({ name: u.name, tasks: u.total }))

    const performance = Object.values(userStats)
      .filter((u) => u.total > 0 || u.completed > 0)
      .sort((a, b) => b.completed - a.completed || b.total - a.total)
      .map((u, i) => ({ ...u, rank: i + 1 }))

    return {
      kpis: { totalTasks, overdue: overdueTasks.length, completionRate, totalPoints },
      statusData,
      weeklyData,
      employeeData,
      performance,
    }
  }, [tasks, users, loading])

  if (loading) {
    return <DashboardSkeleton />
  }

  const hasData = tasks.length > 0

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
            value={kpis.totalTasks}
            icon={Target}
            colorClass="text-primary"
          />
          <MetricCard
            title="Atrasadas"
            value={kpis.overdue}
            icon={Clock}
            colorClass="text-destructive"
          />
          <MetricCard
            title="Taxa de Conclusão"
            value={`${kpis.completionRate}%`}
            icon={CheckCircle}
            colorClass="text-success"
          />
          <MetricCard
            title="Pontos Globais"
            value={kpis.totalPoints}
            icon={Trophy}
            colorClass="text-accent"
          />
        </div>

        {!hasData ? (
          <div className="flex flex-col items-center justify-center p-12 mt-8 text-center border-2 border-dashed rounded-xl border-border/60 bg-card/30">
            <AlertCircle className="w-12 h-12 mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-bold text-foreground">Sem dados disponíveis</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Não há tarefas registradas para o período selecionado. Tente alterar o filtro acima.
            </p>
          </div>
        ) : (
          <>
            <AdminCharts
              statusData={statusData}
              weeklyData={weeklyData}
              employeeData={employeeData}
            />
            <AdminTable performance={performance} />
          </>
        )}
      </div>
    </PageTransition>
  )
}
