import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

interface AdminChartsProps {
  statusData: any[]
  weeklyData: any[]
  employeeData: any[]
}

const statusConfig = {
  todo: { label: 'A Fazer', color: 'hsl(var(--muted-foreground))' },
  inProgress: { label: 'Em Progresso', color: '#3b82f6' },
  review: { label: 'Em Revisão', color: 'hsl(var(--accent))' },
  done: { label: 'Concluído', color: '#22c55e' },
}

const weeklyConfig = {
  tasks: { label: 'Tarefas Concluídas', color: 'hsl(var(--primary))' },
}

const employeeConfig = {
  tasks: { label: 'Volume de Tarefas', color: 'hsl(var(--accent))' },
}

export function AdminCharts({ statusData, weeklyData, employeeData }: AdminChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-muted-foreground uppercase">
            Tarefas por Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={statusConfig} className="h-[250px] w-full">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={statusConfig[entry.key as keyof typeof statusConfig]?.color}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend content={<ChartLegendContent />} className="flex-wrap" />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-muted-foreground uppercase">
            Produtividade Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={weeklyConfig} className="h-[250px] w-full">
            <LineChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="var(--color-tasks)"
                strokeWidth={3}
                dot={{ r: 4, fill: 'var(--color-tasks)' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-muted-foreground uppercase">
            Tarefas por Colaborador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={employeeConfig} className="h-[250px] w-full">
            <BarChart data={employeeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="tasks" fill="var(--color-tasks)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
