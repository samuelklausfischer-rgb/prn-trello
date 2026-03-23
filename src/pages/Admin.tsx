import useAuthStore from '@/stores/useAuthStore'
import { Navigate } from 'react-router-dom'
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
import { Activity, ShieldCheck } from 'lucide-react'

export default function Admin() {
  const { user } = useAuthStore()

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  const mockUsers = [
    { id: '1', name: 'João Silva', email: 'admin@prn.com', role: 'ADMIN', level: 3, points: 1250 },
    {
      id: '2',
      name: 'Maria Oliveira',
      email: 'maria@prn.com',
      role: 'EMPLOYEE',
      level: 2,
      points: 980,
    },
    {
      id: '3',
      name: 'Carlos Souza',
      email: 'carlos@prn.com',
      role: 'EMPLOYEE',
      level: 2,
      points: 840,
    },
    { id: '4', name: 'Ana Costa', email: 'ana@prn.com', role: 'EMPLOYEE', level: 1, points: 420 },
  ]

  const mockLogs = [
    {
      id: '1',
      event: 'Task Created (Revisão Financeira)',
      user: 'João Silva',
      date: 'Hoje, 10:30',
    },
    { id: '2', event: 'Status Updated -> IN_PROGRESS', user: 'Carlos Souza', date: 'Hoje, 09:15' },
    { id: '3', event: 'Task Completed (+50 pts)', user: 'Equipe RH', date: 'Ontem, 16:45' },
    { id: '4', event: 'User Login', user: 'Maria Oliveira', date: 'Ontem, 08:00' },
  ]

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-10 h-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Painel Administrativo</h1>
          <p className="text-muted-foreground font-medium text-lg">
            Gerencie usuários e monitore as atividades do sistema.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="shadow-elevation border-primary/10 lg:col-span-2">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-xl">Gerenciamento de Equipe</CardTitle>
            <CardDescription>
              Visão geral de todos os colaboradores registrados no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold text-foreground">Colaborador</TableHead>
                  <TableHead className="font-semibold text-foreground">Permissão</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">
                    Nível / Pontos
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/30">
                    <TableCell className="py-4">
                      <p className="font-bold text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.role === 'ADMIN' ? 'default' : 'secondary'}
                        className="font-bold tracking-wider text-[10px]"
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
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-accent" />
              Logs Recentes
            </CardTitle>
            <CardDescription>Atividades sistêmicas.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-5">
              {mockLogs.map((log) => (
                <div key={log.id} className="relative pl-5">
                  <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-primary/40 ring-4 ring-background"></div>
                  <p className="font-semibold text-sm text-foreground mb-0.5">{log.event}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                    <span>por {log.user}</span>
                    <span>{log.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
