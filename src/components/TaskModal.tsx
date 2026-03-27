import { useEffect } from 'react'
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
import { updateTask, TaskRecord } from '@/services/tasks'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskChecklist } from './TaskChecklist'
import { TaskHistoryTimeline } from './TaskHistoryTimeline'
import { format } from 'date-fns'

const schema = z.object({
  title: z.string().min(1, 'Obrigatório'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  delegated_to: z.string().optional(),
  points_reward: z.coerce.number().min(0),
  is_archived: z.boolean().default(false),
  is_private: z.boolean().default(false),
  due_date_input: z.string().optional(),
  due_time_input: z.string().optional(),
  deadline_type: z.enum(['mandatory', 'optional']).default('optional'),
})

export default function TaskModal({
  task,
  open,
  onOpenChange,
  users,
  isAdmin,
}: {
  task: TaskRecord | null
  open: boolean
  onOpenChange: (o: boolean) => void
  users: any[]
  isAdmin?: boolean
}) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'todo',
      priority: 'low',
      points_reward: 50,
      title: '',
      description: '',
      is_archived: false,
      is_private: false,
      due_date_input: '',
      due_time_input: '',
      deadline_type: 'optional',
    },
  })

  useEffect(() => {
    if (task && open) {
      let d = '',
        t = ''
      if (task.due_date) {
        const dateObj = new Date(task.due_date)
        d = format(dateObj, 'yyyy-MM-dd')
        t = format(dateObj, 'HH:mm')
      }

      form.reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        delegated_to: task.delegated_to || '',
        points_reward: task.points_reward || 0,
        is_archived: task.is_archived || false,
        is_private: task.is_private || false,
        due_date_input: d,
        due_time_input: t,
        deadline_type: task.deadline_type || 'optional',
      })
    }
  }, [task, open, form])

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (!task) return
    try {
      let finalDueDate = ''
      if (values.due_date_input) {
        const time = values.due_time_input || '23:59:59'
        const timeStr = time.length === 5 ? `${time}:59` : time
        finalDueDate = new Date(`${values.due_date_input}T${timeStr}`).toISOString()
      }

      await updateTask(task.id, {
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        delegated_to: values.is_private
          ? task.created_by
          : values.delegated_to === 'unassigned'
            ? ''
            : values.delegated_to,
        points_reward: values.points_reward,
        is_archived: values.is_archived,
        is_private: values.is_private,
        due_date: finalDueDate,
        deadline_type: values.deadline_type,
      })
      onOpenChange(false)
    } catch (e) {
      const errs = extractFieldErrors(e)
      Object.entries(errs).forEach(([k, v]) => form.setError(k as any, { message: v }))
    }
  }

  if (!task) return null

  const isPrivateWatch = form.watch('is_private')
  const employeeUsers = users.filter(
    (u: any) => u.role?.toLowerCase() === 'employee' || u.role === 'EMPLOYEE',
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent
            value="details"
            className="mt-4 focus-visible:outline-none focus-visible:ring-0"
          >
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

                {!isPrivateWatch && (
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

                <div className="grid grid-cols-2 gap-4 items-end">
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
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="is_archived"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 shadow-sm h-10">
                          <FormLabel className="mb-0 text-xs font-medium">Arquivada</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {isAdmin && (
                      <FormField
                        control={form.control}
                        name="is_private"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 shadow-sm h-10 border-accent/30 bg-accent/5">
                            <FormLabel className="mb-0 text-xs font-medium text-accent">
                              Privada
                            </FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                {task.id && (
                  <div className="pt-2 mt-4 border-t">
                    <TaskChecklist taskId={task.id} />
                  </div>
                )}

                <Button type="submit" className="w-full mt-4">
                  Salvar Alterações
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent
            value="history"
            className="mt-4 focus-visible:outline-none focus-visible:ring-0"
          >
            <TaskHistoryTimeline taskId={task.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
