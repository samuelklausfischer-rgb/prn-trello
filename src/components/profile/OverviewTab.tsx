import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Zap } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function OverviewTab({
  user,
  currentLevel,
  nextLevel,
}: {
  user: any
  currentLevel: any
  nextLevel: any
}) {
  const currentXp = user.xp || 0
  const minXp = currentLevel?.min_xp || 0
  const maxXp = currentLevel?.max_xp || 100
  const progressPercent = Math.min(100, Math.max(0, ((currentXp - minXp) / (maxXp - minXp)) * 100))

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="bg-background/60 backdrop-blur-md border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Progresso do Nível
          </CardTitle>
          <CardDescription>Seu desenvolvimento rumo ao próximo nível</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-2/3">
              <div className="flex justify-between items-end mb-2">
                <div className="space-y-1">
                  <p className="text-4xl font-bold text-foreground tracking-tight">
                    {currentXp}{' '}
                    <span className="text-lg font-medium text-muted-foreground">XP</span>
                  </p>
                </div>
                {nextLevel && (
                  <p className="text-sm font-semibold text-muted-foreground text-right">
                    Meta: {maxXp} XP
                  </p>
                )}
              </div>
              <Progress value={progressPercent} className="h-4 rounded-full" />
              <p className="text-sm text-muted-foreground mt-3 font-medium">
                {nextLevel
                  ? `Faltam ${maxXp - currentXp} XP para alcançar o nível ${nextLevel.level_number} (${nextLevel.name})`
                  : 'Você alcançou o nível máximo!'}
              </p>
            </div>

            <div className="w-full md:w-1/3 flex items-center justify-center p-6 bg-background/50 rounded-xl border border-border/30">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-3">
                  <Zap className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-foreground">{currentLevel?.name || 'Iniciante'}</h4>
                <p className="text-xs text-muted-foreground mt-1">Nível Atual: {user.level}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background/60 backdrop-blur-md border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Sobre mim</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80 leading-relaxed">
            {user.bio || 'Nenhuma biografia informada.'}
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Telefone" value={user.phone || 'Não informado'} />
            <InfoItem label="Departamento" value={user.department || 'Não informado'} />
            <InfoItem
              label="Membro desde"
              value={
                user.created
                  ? format(parseISO(user.created), "dd 'de' MMMM, yyyy", { locale: ptBR })
                  : '-'
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}
