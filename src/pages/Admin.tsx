import { useAuth } from '@/hooks/useAuthHooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Activity, ShieldCheck, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import PageTransition from '@/components/PageTransition'

export default function Admin() {
  useAuth()

  const mockUsers = [
    { id: '1', name: 'Admin Geral', email: 'admin@prn.com', role: 'ADMIN', level: 3, points: 1250 },
    { id: '2', name: 'João Silva', email: 'joao@prn.com', role: 'EMPLOYEE', level: 1, points: 420 },
    {
      id: '3',
      name: 'Maria Oliveira',
      email: 'maria@prn.com',
      role: 'EMPLOYEE',
      level: 2,
      points: 980,
    },
    {
      id: '4',
      name: 'Pedro Souza',
      email: 'pedro@prn.com',
      role: 'EMPLOYEE',
      level: 2,
      points: 650,
    },
    { id: '5', name: 'Ana Costa', email: 'ana@prn.com', role: 'EMPLOYEE', level: 1, points: 210 },
  ]

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
                Gerencie usuários e monitore o acesso do sistema.
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
                  {mockUsers.map((u) => (
                    <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="py-4">
                        <p className="font-bold text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={u.role === 'ADMIN' ? 'default' : 'secondary'}
                          className={`font-bold tracking-wider text-[10px] ${u.role === 'ADMIN' ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                        >
                          {u.role === 'ADMIN' ? 'ADMINISTRADOR' : 'FUNCIONÁRIO'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-bold text-primary">Nível {u.level}</p>
                        <p className="text-xs text-muted-foreground font-medium">{u.points} pts</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-subtle border-border/60">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-accent" />
                Auditoria de Acesso
              </CardTitle>
              <CardDescription>Atividades recentes no sistema.</CardDescription>
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
    </PageTransition>
  )
}
