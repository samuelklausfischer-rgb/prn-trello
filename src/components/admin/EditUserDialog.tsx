import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { updateUser } from '@/services/users'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  job_title: z.string().max(100).optional().default(''),
  department: z.string().max(100).optional().default(''),
  role: z.enum(['admin', 'employee']),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface EditUserDialogProps {
  user: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (updatedUser: any) => void
}

export function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const isSelf = pb.authStore.record?.id === user?.id

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      job_title: '',
      department: '',
      role: 'employee',
      is_active: true,
    },
  })

  useEffect(() => {
    if (user && open) {
      form.reset({
        name: user.name || '',
        job_title: user.job_title || '',
        department: user.department || '',
        role: user.role || 'employee',
        is_active: user.is_active ?? true,
      })
    }
  }, [user, open, form])

  const onSubmit = async (data: FormData) => {
    if (!user) return
    try {
      setLoading(true)
      const updatedUser = await updateUser(user.id, data)
      toast({ title: 'Usuário atualizado com sucesso!' })
      onSuccess(updatedUser)
      onOpenChange(false)
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          form.setError(field as any, { message })
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao atualizar usuário',
          description: err.message || 'Ocorreu um erro inesperado.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome do usuário" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Desenvolvedor" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: TI" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Acesso</FormLabel>
                  <Select disabled={isSelf} onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um nível" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="employee">Colaborador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  {isSelf && (
                    <p className="text-[0.8rem] text-muted-foreground">
                      Você não pode alterar seu próprio nível de acesso.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Status da Conta</FormLabel>
                    <p className="text-[0.8rem] text-muted-foreground">
                      {field.value ? 'Usuário ativo no sistema' : 'Usuário inativo'}
                    </p>
                    {isSelf && (
                      <p className="text-[0.8rem] text-destructive">
                        Você não pode desativar sua própria conta.
                      </p>
                    )}
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSelf}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
