import { useState, useEffect, useMemo } from 'react'
import { Search, Send } from 'lucide-react'
import { getUsers } from '@/services/users'
import { createAlert } from '@/services/alerts'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/useAuthHooks'
import { UserCard } from '@/components/UserCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function AdminEmployees() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notifyTitle, setNotifyTitle] = useState('')
  const [notifyMessage, setNotifyMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const loadUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      toast.error('Erro ao carregar funcionários')
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useRealtime('users', () => {
    loadUsers()
  })

  const departments = useMemo(() => {
    const deps = users.map((u) => u.department).filter(Boolean)
    return Array.from(new Set(deps))
  }, [users])

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || false
      const matchesDep = department === 'all' || u.department === department
      return matchesSearch && matchesDep
    })
  }, [users, search, department])

  const admins = useMemo(() => filteredUsers.filter((u) => u.role === 'admin'), [filteredUsers])
  const employees = useMemo(() => filteredUsers.filter((u) => u.role !== 'admin'), [filteredUsers])

  const handleOpenNotification = (user: any) => {
    setSelectedUser(user)
    setNotifyTitle('')
    setNotifyMessage('')
    setIsDialogOpen(true)
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !notifyTitle || !notifyMessage) return

    setIsSending(true)
    try {
      await createAlert({
        type: 'custom',
        target_user: selectedUser.id,
        title: notifyTitle,
        message: notifyMessage,
        created_by: currentUser?.id,
        is_sent: true,
      })
      toast.success('Notificação enviada com sucesso!')
      setIsDialogOpen(false)
    } catch (error) {
      toast.error('Erro ao enviar notificação')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e acompanhe o desempenho de todos os usuários
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="flex h-10 w-full sm:w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
        >
          <option value="all">Todos os departamentos</option>
          {departments.map((dep) => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-10">
        {admins.length > 0 && (
          <section className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-2">
              Usuários Admin{' '}
              <span className="text-muted-foreground text-base font-medium">({admins.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {admins.map((user) => (
                <UserCard key={user.id} user={user} isAdmin onNotify={handleOpenNotification} />
              ))}
            </div>
          </section>
        )}

        {employees.length > 0 && (
          <section className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-2">
              Funcionários{' '}
              <span className="text-muted-foreground text-base font-medium">
                ({employees.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {employees.map((user) => (
                <UserCard key={user.id} user={user} onNotify={handleOpenNotification} />
              ))}
            </div>
          </section>
        )}

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-muted-foreground bg-card rounded-xl border border-border/50">
            Nenhum usuário encontrado com os filtros atuais.
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enviar Notificação</DialogTitle>
            <DialogDescription>Envie um alerta direto para {selectedUser?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendNotification} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <input
                id="title"
                type="text"
                placeholder="Ex: Parabéns pelo desempenho!"
                value={notifyTitle}
                onChange={(e) => setNotifyTitle(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite a mensagem da notificação..."
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {isSending ? (
                  'Enviando...'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar
                  </>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
