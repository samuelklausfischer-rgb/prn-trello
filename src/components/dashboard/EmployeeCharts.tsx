import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
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

interface EmployeeChartsProps {
  productivityData: any[]
  progressData: any[]
  teamComparison: any[]
}

const prodConfig = { tasks: { label: 'Tarefas Concluídas', color: 'hsl(var(--primary))' } }

const progConfig = {
  todo: { label: 'A Fazer', color: 'hsl(var(--muted-foreground))' },
  inProgress: { label: 'Em Progresso', color: '#3b82f6' },
  done: { label: 'Concluído', color: '#22c55e' },
}

const compConfig = {
  value: { label: 'Pontos', color: 'hsl(var(--accent))' },
}

export function EmployeeCharts({
  productivityData,
  progressData,
  teamComparison,
}: EmployeeChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="shadow-sm lg:col-span-2 flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-muted-foreground uppercase">
            Sua Produtividade (Últimos 7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-[250px]">
          <ChartContainer config={prodConfig} className="h-full w-full">
            <LineChart data={productivityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="capitalize"
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="var(--color-tasks)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="space-y-6 lg:col-span-1 flex flex-col h-full">
        <Card className="shadow-sm flex-1 flex flex-col justify-center">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase text-center">
              Status das Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-4 flex justify-center items-center">
            {progressData.length > 0 ? (
              <ChartContainer config={progConfig} className="h-[140px] w-full">
                <PieChart>
                  <Pie
                    data={progressData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {progressData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={progConfig[entry.key as keyof typeof progConfig]?.color}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[140px] flex items-center justify-center text-muted-foreground text-sm">
                Sem tarefas ativas
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm flex-1 flex flex-col justify-center">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">
              Você vs Média da Equipe (Pontos)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            <ChartContainer config={compConfig} className="h-[100px] w-full">
              <BarChart
                data={teamComparison}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fontWeight: 500 }}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} barSize={24}>
                  {teamComparison.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.type === 'user'
                          ? 'hsl(var(--primary))'
                          : 'hsl(var(--muted-foreground))'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
