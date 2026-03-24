import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuthHooks'
import { getUsers } from '@/services/users'
import { createAlert } from '@/services/alerts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, ShieldCheck, Search, BellRing } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import PageTransition from '@/components/PageTransition'

export default function Admin() {
  const { user } = useAuth()

  const [users, setUsers] = useState<any[]>([])
  const [alertTitle, setAlertTitle] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState('system')
  const [targetType, setTargetType] = useState<'all' | 'role' | 'user'>('all')
  const [targetRole, setTargetRole] = useState('employee')
  const [targetUser, setTargetUser] = useState('')
  const [actionUrl, setActionUrl] = useState('')
  const [sendNow, setSendNow] = useState(true)
  const [scheduledFor, setScheduledFor] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers()
        setUsers(data)
      } catch (error) {
        console.error('Failed to fetch users', error)
      }
    }
    fetchUsers()
  }, [])

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alertTitle || !alertMessage || !user) return

    if (targetType === 'user' && !targetUser) {
      toast({ title: 'Selecione um usuário', variant: 'destructive' })
      return
    }

    if (!sendNow && !scheduledFor) {
      toast({ title: 'Selecione uma data para envio', variant: 'destructive' })
      return
    }

    try {
      await createAlert({
        title: alertTitle,
        message: alertMessage,
        type: alertType,
        target_user: targetType === 'user' ? targetUser : null,
        target_role: targetType === 'role' ? targetRole : null,
        action_url: actionUrl,
        created_by: user.id,
        is_sent: sendNow,
        scheduled_for: sendNow ? null : new Date(scheduledFor).toISOString(),
      })

      toast({ title: 'Alerta programado com sucesso!' })
      setAlertTitle('')
      setAlertMessage('')
      setActionUrl('')
      setScheduledFor('')
    } catch (error) {
      toast({ title: 'Erro ao criar alerta', variant: 'destructive' })
    }
  }

  const mockLogs = [
    {
      id: '1',
      event: 'Task Created (Revisão Financeira)',
      user: 'João Silva',
      date: 'Hoje, 10:30',
    },
    {
      id: '2',
      event: 'Status Updated -> IN_PROGRESS',
      user: 'Maria Oliveira',
      date: 'Hoje, 09:15',
    },
    { id: '3', event: 'User Login', user: 'Pedro Souza', date: 'Hoje, 08:45' },
    { id: '4', event: 'Task Completed (+50 pts)', user: 'Ana Costa', date: 'Ontem, 16:45' },
    { id: '5', event: 'Role Escalation', user: 'Admin Geral', date: 'Ontem, 08:00' },
  ]

  return (
    <PageTransition>
      <div className="space-y-8 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Painel Administrativo
              </h1>
              <p className="text-muted-foreground font-medium">
                Gerencie usuários, permissões e comunicações do sistema.
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Buscar colaborador"
              placeholder="Buscar colaborador..."
              className="pl-9 bg-background border-border"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <Card className="shadow-elevation border-border xl:col-span-2 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-xl">Equipe Registrada</CardTitle>
              <CardDescription>Gestão de permissões (RBAC) e status geral.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold text-foreground py-4">
                      Colaborador
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">Acesso</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">
                      Desempenho
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="py-4">
                        <p className="font-bold text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={u.role === 'admin' ? 'default' : 'secondary'}
                          className={`font-bold tracking-wider text-[10px] uppercase ${u.role === 'admin' ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-bold text-primary">Nível {u.level || 1}</p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {u.points || 0} pts
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-subtle border-border/60">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BellRing className="w-5 h-5 text-accent" />
                  Enviar Alerta
                </CardTitle>
                <CardDescription>
                  Comunique-se com a equipe ou indivíduos via Notificações.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleCreateAlert} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetType">Destino</Label>
                    <Select value={targetType} onValueChange={(v: any) => setTargetType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Usuários</SelectItem>
                        <SelectItem value="role">Por Cargo</SelectItem>
                        <SelectItem value="user">Usuário Específico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {targetType === 'role' && (
                    <div className="space-y-2">
                      <Label htmlFor="targetRole">Cargo</Label>
                      <Select value={targetRole} onValueChange={setTargetRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="employee">Funcionário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {targetType === 'user' && (
                    <div className="space-y-2">
                      <Label htmlFor="targetUser">Usuário</Label>
                      <Select value={targetUser} onValueChange={setTargetUser}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Alerta</Label>
                    <Select value={alertType} onValueChange={setAlertType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">Sistema</SelectItem>
                        <SelectItem value="task_deadline">Prazo de Tarefa</SelectItem>
                        <SelectItem value="achievement">Conquista</SelectItem>
                        <SelectItem value="performance">Desempenho</SelectItem>
                        <SelectItem value="custom">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={alertTitle}
                      onChange={(e) => setAlertTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      value={alertMessage}
                      onChange={(e) => setAlertMessage(e.target.value)}
                      className="resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actionUrl">Link de Ação (Opcional)</Label>
                    <Input
                      id="actionUrl"
                      value={actionUrl}
                      onChange={(e) => setActionUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center space-x-2 py-2">
                    <Switch id="sendNow" checked={sendNow} onCheckedChange={setSendNow} />
                    <Label htmlFor="sendNow">Enviar Imediatamente</Label>
                  </div>

                  {!sendNow && (
                    <div className="space-y-2">
                      <Label htmlFor="scheduledFor">Agendar para</Label>
                      <Input
                        id="scheduledFor"
                        type="datetime-local"
                        value={scheduledFor}
                        onChange={(e) => setScheduledFor(e.target.value)}
                        required={!sendNow}
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full">
                    {sendNow ? 'Disparar Alerta' : 'Agendar Alerta'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-subtle border-border/60">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-muted-foreground" />
                  Auditoria de Acesso
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-6">
                  {mockLogs.map((log) => (
                    <div
                      key={log.id}
                      className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-[-24px] before:w-px before:bg-border last:before:hidden"
                    >
                      <div className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-background z-10"></div>
                      <p className="font-semibold text-sm text-foreground mb-1 leading-none">
                        {log.event}
                      </p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                        <span>{log.user}</span>
                        <span>{log.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
