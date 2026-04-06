import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { createTask } from '@/services/tasks'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import pb from '@/lib/pocketbase/client'
import { Textarea } from '@/components/ui/textarea'
import { getProjects, ProjectRecord } from '@/services/projects'
import { useState, useEffect } from 'react'

const schema = z.object({
  title: z.string().min(1, 'Obrigatório'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  delegated_to: z.string().optional(),
  project_id: z.string().optional(),
  points_reward: z.coerce.number().min(0).default(50),
  due_date_input: z.string().optional(),
  due_time_input: z.string().optional(),
  deadline_type: z.enum(['mandatory', 'optional']).default('optional'),
})

export default function NewTaskDialog({
  open,
  onOpenChange,
  users,
  isPrivateWorkspace,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  users: any[]
  isPrivateWorkspace?: boolean
}) {
  const [projects, setProjects] = useState<ProjectRecord[]>([])

  useEffect(() => {
    if (open) {
      getProjects().then(setProjects).catch(console.error)
    }
  }, [open])

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'todo',
      priority: 'low',
      points_reward: 50,
      title: '',
      description: '',
      due_date_input: '',
      due_time_input: '',
      deadline_type: 'optional',
    },
  })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      let finalDueDate = ''
      if (values.due_date_input) {
        const time = values.due_time_input || '23:59:59'
        const timeStr = time.length === 5 ? `${time}:59` : time
        finalDueDate = new Date(`${values.due_date_input}T${timeStr}`).toISOString()
      }

      await createTask({
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        delegated_to: isPrivateWorkspace
          ? pb.authStore.record?.id
          : values.delegated_to === 'unassigned'
            ? ''
            : values.delegated_to,
        points_reward: values.points_reward,
        due_date: finalDueDate,
        deadline_type: values.deadline_type,
        project_id: values.project_id === 'none' ? '' : values.project_id,
        created_by: pb.authStore.record?.id,
        is_private: !!isPrivateWorkspace,
        order: 0,
      })
      onOpenChange(false)
      form.reset()
    } catch (e) {
      const errs = extractFieldErrors(e)
      Object.entries(errs).forEach(([k, v]) => form.setError(k as any, { message: v }))
    }
  }

  const employeeUsers = users.filter(
    (u: any) => u.role?.toLowerCase() === 'employee' || u.role === 'EMPLOYEE',
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>{isPrivateWorkspace ? 'Nova Tarefa Pessoal' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none h-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projeto (Opcional)</FormLabel>
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(val) => field.onChange(val === 'none' ? '' : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhum projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum projeto</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: p.color || '#ccc' }}
                            />
                            {p.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">A Fazer</SelectItem>
                        <SelectItem value="in_progress">Em Progresso</SelectItem>
                        <SelectItem value="review">Em Revisão</SelectItem>
                        <SelectItem value="done">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-[1fr_1fr] gap-4">
              <FormField
                control={form.control}
                name="due_date_input"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Prazo</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="due_time_input"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Hora (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deadline_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Prazo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="optional">Opcional (Soft Deadline)</SelectItem>
                      <SelectItem value="mandatory">Obrigatório (Hard Deadline)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isPrivateWorkspace && (
              <FormField
                control={form.control}
                name="delegated_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Atribuir a</FormLabel>
                    <Select
                      value={field.value || 'unassigned'}
                      onValueChange={(val) => field.onChange(val === 'unassigned' ? '' : val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sem responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Sem responsável</SelectItem>
                        {employeeUsers.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="points_reward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pontos (Recompensa)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-4">
              Criar Tarefa
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
