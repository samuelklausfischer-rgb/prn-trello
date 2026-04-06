import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { createAlert } from '@/services/alerts'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { format } from 'date-fns'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommunicationTabProps {
  alerts: any[]
  users: any[]
  onRefresh: () => void
}

export function CommunicationTab({ alerts, users, onRefresh }: CommunicationTabProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'custom',
  })

  const [recipientType, setRecipientType] = useState<'global' | 'role' | 'user'>('global')
  const [selectedRole, setSelectedRole] = useState('employee')
  const [selectedUser, setSelectedUser] = useState('')
  const [openUserCombo, setOpenUserCombo] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    if (recipientType === 'user' && !selectedUser) {
      setErrors({ target_user: 'Por favor, selecione um colaborador.' })
      setLoading(false)
      return
    }

    try {
      const payload: Record<string, any> = {
        ...formData,
        created_by: pb.authStore.record?.id,
        is_sent: true,
      }

      if (recipientType === 'role' && selectedRole) {
        payload.target_role = selectedRole
      }
      if (recipientType === 'user' && selectedUser) {
        payload.target_user = selectedUser
      }

      await createAlert(payload)
      toast.success('Alerta criado com sucesso!')

      setFormData({
        title: '',
        message: '',
        type: 'custom',
      })
      setRecipientType('global')
      setSelectedRole('employee')
      setSelectedUser('')
      onRefresh()
    } catch (err: any) {
      setErrors(extractFieldErrors(err))
      const errorMessage =
        err?.response?.message || err?.message || 'Erro de conexão ou restrição no banco de dados.'
      toast.error(`Falha ao despachar alerta: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm glass-card">
        <CardHeader>
          <CardTitle>Novo Alerta do Sistema</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Envie notificações para usuários específicos ou grupos.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título do Alerta *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Ex: Atualização Importante"
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label>Tipo de Alerta *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Mensagem Personalizada</SelectItem>
                    <SelectItem value="system">Anúncio Global (Sistema)</SelectItem>
                    <SelectItem value="performance">Feedback de Desempenho</SelectItem>
                    <SelectItem value="bottleneck">Alerta Urgente</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
              </div>

              <div className="space-y-2">
                <Label>Público Alvo *</Label>
                <Select
                  value={recipientType}
                  onValueChange={(v: 'global' | 'role' | 'user') => {
                    setRecipientType(v)
                    setErrors((prev) => ({ ...prev, target_user: '', target_role: '' }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Todos os Usuários</SelectItem>
                    <SelectItem value="role">Por Cargo</SelectItem>
                    <SelectItem value="user">Colaborador Específico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {recipientType === 'role' && (
                <div className="space-y-2 animate-fade-in-up">
                  <Label>Selecione o Cargo *</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="employee">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.target_role && (
                    <p className="text-xs text-destructive">{errors.target_role}</p>
                  )}
                </div>
              )}

              {recipientType === 'user' && (
                <div className="space-y-2 animate-fade-in-up flex flex-col">
                  <Label>Selecione o Colaborador *</Label>
                  <Popover open={openUserCombo} onOpenChange={setOpenUserCombo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openUserCombo}
                        className={cn(
                          'w-full justify-between font-normal',
                          !selectedUser && 'text-muted-foreground',
                        )}
                      >
                        {selectedUser
                          ? users.find((u) => u.id === selectedUser)?.name ||
                            users.find((u) => u.id === selectedUser)?.email ||
                            'Usuário selecionado'
                          : 'Buscar colaborador...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Buscar por nome ou email..." />
                        <CommandList>
                          <CommandEmpty>Nenhum colaborador encontrado.</CommandEmpty>
                          <CommandGroup>
                            {users
                              .filter((u) => u.is_active)
                              .map((user) => (
                                <CommandItem
                                  key={user.id}
                                  value={`${user.name || ''} ${user.email || ''}`}
                                  onSelect={() => {
                                    setSelectedUser(user.id)
                                    setOpenUserCombo(false)
                                    setErrors((prev) => ({ ...prev, target_user: '' }))
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      selectedUser === user.id ? 'opacity-100' : 'opacity-0',
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{user.name || 'Sem nome'}</span>
                                    {user.email && (
                                      <span className="text-xs text-muted-foreground">
                                        {user.email}
                                      </span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.target_user && (
                    <p className="text-xs text-destructive">{errors.target_user}</p>
                  )}
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label>Mensagem *</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={3}
                  placeholder="Digite a mensagem do alerta..."
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Publicando...' : 'Publicar Alerta'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm glass-card">
        <CardHeader>
          <CardTitle>Histórico de Comunicações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Público Alvo</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-foreground">{a.title}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">
                    {a.type.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {a.target_user
                      ? 'Usuário Específico'
                      : a.target_role
                        ? `Cargo: ${a.target_role === 'admin' ? 'Administrador' : 'Colaborador'}`
                        : 'Global'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {a.created ? format(new Date(a.created), 'dd/MM/yyyy HH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.is_sent
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      {a.is_sent ? 'Enviado' : 'Pendente'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {alerts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Nenhum alerta encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
