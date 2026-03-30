import { useState, useEffect, useMemo } from 'react'
import { Search, Bell, Medal, Flame, Star, Send } from 'lucide-react'
import { getUsers } from '@/services/users'
import { createAlert } from '@/services/alerts'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/useAuthHooks'
import pb from '@/lib/pocketbase/client'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
    <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-7xl animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground mt-1">Gerencie e acompanhe o desempenho da equipe</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="glass-panel p-5 rounded-xl border border-border/50 flex flex-col gap-4 hover-3d transition-all bg-card text-card-foreground shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={user.avatar ? pb.files.getURL(user, user.avatar) : undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold line-clamp-1">{user.name || 'Sem nome'}</h3>
                  {user.department && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {user.department}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/50">
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50">
                <Star className="h-4 w-4 text-yellow-500 mb-1" />
                <span className="text-xs text-muted-foreground">Nível</span>
                <span className="font-bold">{user.level || 1}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50">
                <Medal className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-xs text-muted-foreground">XP</span>
                <span className="font-bold">{user.xp || 0}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50">
                <Flame className="h-4 w-4 text-orange-500 mb-1" />
                <span className="text-xs text-muted-foreground">Dias</span>
                <span className="font-bold">{user.streak_days || 0}</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenNotification(user)}
              className="mt-auto inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-primary hover:text-primary-foreground h-10 px-4 py-2 gap-2 group"
            >
              <Bell className="h-4 w-4 group-hover:animate-shake" />
              Notificar
            </button>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Nenhum funcionário encontrado com os filtros atuais.
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
