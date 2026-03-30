import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuthHooks'
import { getPointsHistory, getLevels, PointHistory, Level } from '@/services/gamification'
import { updateUser } from '@/services/users'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
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
import { Trophy, Star, History, Target, TrendingUp, Pencil } from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function Profile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [history, setHistory] = useState<PointHistory[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    role: '',
    job_title: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        phone: user.phone || '',
        role: user.role || 'EMPLOYEE',
        job_title: user.job_title || '',
      })
    }
  }, [user, isEditing])

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

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        job_title: formData.job_title,
        role: formData.role.toLowerCase(), // Trigger RLS validation if self-promoting
      }

      const updatedRecord = await updateUser(user.id, payload)
      pb.authStore.save(pb.authStore.token, updatedRecord)

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      })
      setIsEditing(false)
    } catch (err: any) {
      toast({
        title: 'Acesso Negado',
        description:
          'Você não tem permissão para realizar esta alteração (ex: alterar seu nível de acesso).',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Trophy className="w-8 h-8 text-amber-500" /> Meu Perfil
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe seu desempenho e histórico de evolução na plataforma.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
            <Pencil className="w-4 h-4" /> Editar Perfil
          </Button>
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
                {user.job_title && (
                  <p className="text-sm font-semibold text-primary mt-1">{user.job_title}</p>
                )}
                <p className="text-sm text-muted-foreground font-medium">{user.email}</p>

                {user.phone && <p className="text-xs text-muted-foreground mt-1">{user.phone}</p>}
                {user.bio && (
                  <p className="text-sm mt-3 px-4 text-foreground/80 italic">"{user.bio}"</p>
                )}

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

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
              <DialogDescription>
                Atualize suas informações pessoais. Mudanças de nível de acesso estão sujeitas a
                validação de segurança (RLS).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="job_title" className="text-right">
                  Cargo
                </Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className="col-span-3"
                  placeholder="Ex: Engenheiro de IA"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Telefone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="col-span-3"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="bio" className="text-right pt-2">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="col-span-3"
                  placeholder="Um pouco sobre você..."
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4 border-t pt-4 mt-2">
                <Label
                  htmlFor="role"
                  className="text-right text-muted-foreground text-xs leading-tight"
                >
                  Cargo
                  <br />
                  (Teste de Segurança)
                </Label>
                <div className="col-span-3">
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="EMPLOYEE">Funcionário</option>
                    <option value="ADMIN">Administrador (Bloqueado)</option>
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Tentar mudar para Administrador resultará em erro se você não possuir acesso
                    prévio.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}
