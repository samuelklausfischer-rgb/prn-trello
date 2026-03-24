import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuthHooks'
import { getPointsHistory, getLevels, PointHistory, Level } from '@/services/gamification'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trophy, Star, History, Target, ArrowUpRight, TrendingUp } from 'lucide-react'
import PageTransition from '@/components/PageTransition'

export default function Profile() {
  const { user } = useAuth()
  const [history, setHistory] = useState<PointHistory[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!user) return
    try {
      const [histData, levelsData] = await Promise.all([getPointsHistory(user.id), getLevels()])
      setHistory(histData)
      setLevels(levelsData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id])

  useRealtime(
    'points_history',
    (e) => {
      if (e.action === 'create' && e.record.user_id === user?.id) {
        setHistory((prev) => [e.record as unknown as PointHistory, ...prev])
      }
    },
    !!user,
  )

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        Carregando perfil...
      </div>
    )
  }

  const currentLevel = levels.find((l) => l.level_number === user.level) || levels[0]
  const nextLevel = levels.find((l) => l.level_number === user.level + 1)

  const currentXp = user.xp || 0
  const minXp = currentLevel?.min_xp || 0
  const maxXp = currentLevel?.max_xp || 100

  const progressPercent = Math.min(100, Math.max(0, ((currentXp - minXp) / (maxXp - minXp)) * 100))

  return (
    <PageTransition>
      <div className="space-y-6 pb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="w-8 h-8 text-amber-500" /> Meu Perfil
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe seu desempenho e histórico de evolução na plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="space-y-6 lg:col-span-1">
            <Card className="shadow-elevation overflow-hidden border-border">
              <div className="h-24 bg-gradient-to-r from-primary/80 to-accent/80"></div>
              <CardContent className="pt-0 px-6 pb-6 text-center relative">
                <Avatar className="w-24 h-24 border-4 border-card mx-auto -mt-12 bg-background shadow-md">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mt-4 text-foreground">{user.name}</h2>
                <p className="text-sm text-muted-foreground font-medium">{user.email}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border shadow-sm">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-sm font-bold text-foreground">Nível {user.level}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    • {currentLevel?.name || 'Iniciante'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-subtle">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Progresso para o Nível {user.level + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end mb-2">
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-foreground tracking-tight">
                      {currentXp}{' '}
                      <span className="text-base font-medium text-muted-foreground">XP</span>
                    </p>
                  </div>
                  {nextLevel && (
                    <p className="text-sm font-semibold text-muted-foreground text-right">
                      {maxXp} XP max
                    </p>
                  )}
                </div>
                <Progress value={progressPercent} className="h-3" />
                <p className="text-xs text-muted-foreground mt-3 font-medium text-center">
                  {nextLevel
                    ? `Faltam ${maxXp - currentXp} XP para alcançar ${nextLevel.name}`
                    : 'Você alcançou o nível máximo!'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-subtle lg:col-span-2">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="w-5 h-5 text-primary" />
                    Histórico de Pontos
                  </CardTitle>
                  <CardDescription>
                    Registro detalhado de todas as suas movimentações de pontos.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-bold text-sm bg-background">
                  Saldo: <span className="text-primary ml-1">{user.points} pts</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead className="text-right">Movimentação</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Saldo Atual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Nenhum ponto registrado ainda. Comece a completar tarefas!
                        </TableCell>
                      </TableRow>
                    ) : (
                      history.map((record) => {
                        const isPositive = record.points > 0
                        return (
                          <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                              {format(parseISO(record.created), "dd/MM/yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Target className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="font-medium text-sm text-foreground">
                                  {record.reason}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={isPositive ? 'default' : 'destructive'}
                                className={`font-bold ${isPositive ? 'bg-success/10 text-success hover:bg-success/20 border-success/20' : ''}`}
                              >
                                {isPositive ? '+' : ''}
                                {record.points} pts
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-foreground hidden sm:table-cell">
                              {record.balance_after}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
