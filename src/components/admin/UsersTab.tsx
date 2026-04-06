import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit2 } from 'lucide-react'
import { EditUserDialog } from './EditUserDialog'

interface UsersTabProps {
  users: any[]
  onUsersChange?: () => void
}

export function UsersTab({ users: initialUsers, onUsersChange }: UsersTabProps) {
  const [editingUser, setEditingUser] = useState<any>(null)
  const [localUsers, setLocalUsers] = useState<any[]>(initialUsers)

  useEffect(() => {
    setLocalUsers(initialUsers)
  }, [initialUsers])

  const handleSuccess = (updatedUser: any) => {
    setLocalUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
    if (onUsersChange) onUsersChange()
  }

  return (
    <Card className="border-border/60 shadow-sm glass-card">
      <CardHeader>
        <CardTitle>Usuários do Sistema</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie os membros da equipe, cargos e níveis de acesso.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold text-foreground">Nome</TableHead>
              <TableHead className="font-semibold text-foreground">Email</TableHead>
              <TableHead className="font-semibold text-foreground">Cargo</TableHead>
              <TableHead className="font-semibold text-foreground">Função</TableHead>
              <TableHead className="font-semibold text-foreground">Status</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localUsers.map((u) => (
              <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-foreground">
                  {u.name || 'Sem nome'}
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{u.job_title || '-'}</TableCell>
                <TableCell>
                  <Badge
                    variant={u.role === 'admin' ? 'default' : 'secondary'}
                    className={
                      u.role === 'admin' ? 'bg-blue-500 hover:bg-blue-600 text-white border-0' : ''
                    }
                  >
                    {u.role === 'admin' ? 'Admin' : 'Colaborador'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={u.is_active ? 'default' : 'destructive'}
                    className={
                      u.is_active ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' : ''
                    }
                  >
                    {u.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingUser(u)}
                    title="Editar usuário"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <EditUserDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onSuccess={handleSuccess}
      />
    </Card>
  )
}
