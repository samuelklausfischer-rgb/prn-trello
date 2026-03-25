import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  colorClass?: string
  subtitle?: string
}

export function MetricCard({ title, value, icon: Icon, colorClass, subtitle }: MetricCardProps) {
  return (
    <Card className="hover-3d glass-card border-white/20 dark:border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="p-2 rounded-xl bg-background/50 backdrop-blur-md shadow-sm border border-border/50">
          <Icon className={cn('h-5 w-5', colorClass || 'text-primary')} />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn('text-3xl font-extrabold tracking-tight', colorClass || 'text-foreground')}
        >
          {value}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1 font-semibold">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
