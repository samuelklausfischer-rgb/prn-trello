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
import { createAlert } from '@/services/alerts'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { format } from 'date-fns'

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
    type: 'system',
    target_role: 'none',
    target_user: 'none',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const payload: any = { ...formData, created_by: pb.authStore.record?.id }
      if (payload.target_role === 'none') delete payload.target_role
      if (payload.target_user === 'none') delete payload.target_user

      await createAlert(payload)
      toast.success('Alerta criado com sucesso!')
      setFormData({
        title: '',
        message: '',
        type: 'system',
        target_role: 'none',
        target_user: 'none',
      })
      onRefresh()
    } catch (err) {
      setErrors(extractFieldErrors(err))
      toast.error('Erro ao criar alerta. Verifique os campos.')
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
                <Label>Título do Alerta</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">Sistema</SelectItem>
                    <SelectItem value="task_deadline">Prazo de Tarefa</SelectItem>
                    <SelectItem value="performance">Desempenho</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
              </div>
              <div className="space-y-2">
                <Label>Usuário Específico</Label>
                <Select
                  value={formData.target_user}
                  onValueChange={(v) => setFormData({ ...formData, target_user: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os usuários" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Todos (Padrão)</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.target_user && (
                  <p className="text-xs text-destructive">{errors.target_user}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Filtrar por Cargo</Label>
                <Select
                  value={formData.target_role}
                  onValueChange={(v) => setFormData({ ...formData, target_role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Qualquer Cargo (Padrão)</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="employee">Colaborador</SelectItem>
                  </SelectContent>
                </Select>
                {errors.target_role && (
                  <p className="text-xs text-destructive">{errors.target_role}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Mensagem</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={3}
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading}>
                Publicar Alerta
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
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
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
