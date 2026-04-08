import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BellRing, Loader2 } from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import { getUsers } from '@/services/users'
import { getAlerts } from '@/services/alerts'
import { UsersTab } from '@/components/admin/UsersTab'
import { CommunicationTab } from '@/components/admin/CommunicationTab'
import { ActivityTab } from '@/components/admin/ActivityTab'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { GuideTour, useTour } from '@/components/GuideTour'

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams()

  const { open: tourOpen, closeTour } = useTour('admin')
  const tourSteps = [
    {
      target: '[data-tour="admin-header"]',
      title: 'Painel Administrativo',
      content:
        'Apenas administradores têm acesso. Aqui você controla configurações globais, usuários e comunicações.',
      placement: 'bottom' as const,
    },
    {
      target: '[data-tour="admin-tabs"]',
      title: 'Gerenciamento de Usuários',
      content:
        'Convide por e-mail, altere papéis e acompanhe as atividades. Cuidado com o botão de Remover, alterações aqui afetam toda a organização!',
      placement: 'bottom' as const,
      image: 'https://img.usecurling.com/p/400/200?q=warning%20security&color=red',
    },
  ]
  const activeTab = searchParams.get('tab') || 'users'

  const [users, setUsers] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [u, a] = await Promise.all([getUsers(), getAlerts()])
      setUsers(u)
      setAlerts(a)
    } catch (err) {
      console.error('Error loading admin data:', err)
      toast.error('Erro ao carregar os dados. Verifique a conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('users', () => {
    loadData()
  })

  useRealtime('alerts', () => {
    loadData()
  })

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  const activeAlertsCount = alerts.filter((a) => !a.is_sent).length

  return (
    <PageTransition>
      <div className="space-y-8 pb-8">
        <GuideTour
          steps={tourSteps}
          open={tourOpen}
          onClose={closeTour}
          estimatedTime="2-3 minutos"
        />
        <div
          data-tour="admin-header"
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              Gerenciamento central de equipe, comunicações e auditoria.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover-3d glass-card border-white/20 dark:border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Total de Colaboradores
              </CardTitle>
              <div className="p-2 rounded-xl bg-background/50 backdrop-blur-md shadow-sm border border-border/50">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                {users.length}
              </div>
            </CardContent>
          </Card>

          <Card className="hover-3d glass-card border-white/20 dark:border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Alertas Ativos
              </CardTitle>
              <div className="p-2 rounded-xl bg-background/50 backdrop-blur-md shadow-sm border border-border/50">
                <BellRing className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                {activeAlertsCount}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList
            data-tour="admin-tabs"
            className="grid w-full grid-cols-3 max-w-md bg-muted/50 p-1"
          >
            <TabsTrigger value="users" className="font-semibold">
              Usuários
            </TabsTrigger>
            <TabsTrigger value="communication" className="font-semibold">
              Comunicação
            </TabsTrigger>
            <TabsTrigger value="activity" className="font-semibold">
              Atividade
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="users" className="m-0 focus-visible:outline-none">
              <UsersTab users={users} />
            </TabsContent>

            <TabsContent value="communication" className="m-0 focus-visible:outline-none">
              <CommunicationTab alerts={alerts} users={users} onRefresh={loadData} />
            </TabsContent>

            <TabsContent value="activity" className="m-0 focus-visible:outline-none">
              <ActivityTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </PageTransition>
  )
}
