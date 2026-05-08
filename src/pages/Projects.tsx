import { useState, useEffect, useMemo } from 'react'
import {
  getProjects,
  ProjectRecord,
  createProject,
  updateProject,
  deleteProject,
} from '@/services/projects'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/useAuthHooks'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage, extractFieldErrors } from '@/lib/pocketbase/errors'
import pb from '@/lib/pocketbase/client'
import PageTransition from '@/components/PageTransition'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Plus,
  FolderKanban,
  Pencil,
  Trash2,
  Calendar,
  Users,
  ShieldAlert,
  Check,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { getUsers } from '@/services/users'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { GuideTour, useTour } from '@/components/GuideTour'
import { Info } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'

const projectSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
  progress: z.coerce.number().min(0).max(100),
  status: z.enum(['active', 'completed', 'on_hold', 'todo', 'in_progress', 'review', 'done']),
  color: z.string().optional(),
  shared_with_users: z.array(z.string()).optional().default([]),
  shared_with_roles: z.array(z.string()).optional().default([]),
})

type ProjectFormValues = z.infer<typeof projectSchema>

const isAdminRole = (role?: string | null) => {
  if (!role) return false
  const normalized = String(role).toLowerCase()
  return ['admin', 'administrator', 'super_admin', 'owner'].includes(normalized)
}

const getOwnerId = (createdBy: any): string | null => {
  if (!createdBy) return null
  if (typeof createdBy === 'string') return createdBy
  if (typeof createdBy === 'object' && createdBy !== null) {
    if (createdBy.id) return createdBy.id
  }
  if (Array.isArray(createdBy) && createdBy.length > 0) {
    const first = createdBy[0]
    if (typeof first === 'string') return first
    if (typeof first === 'object' && first !== null && first.id) return first.id
  }
  return null
}

export default function Projects() {
  const { user, role } = useAuth()
  const { toast } = useToast()
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProjectRecord | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('mine')
  const [filterUser, setFilterUser] = useState('all')

  const { open: tourOpen, closeTour, startTour } = useTour('projects')
  const tourSteps = [
    {
      target: '[data-tour="projects-header"]',
      title: 'Central de Projetos',
      content:
        'Acompanhe o andamento geral das iniciativas. O progresso aqui é calculado automaticamente com base nas tarefas vinculadas.',
      placement: 'bottom' as const,
    },
    {
      target: '[data-tour="projects-tabs"]',
      title: 'Meus x Equipe',
      content:
        'Filtre e visualize rapidamente os projetos de toda a equipe para manter todos alinhados.',
      placement: 'bottom' as const,
    },
    {
      target: '[data-tour="projects-new"]',
      title: 'Criando Projetos',
      content:
        'Crie novos projetos, adicione membros e comece a vincular tarefas. (Nota: Adicione membros para que recebam notificações).',
      placement: 'left' as const,
    },
    {
      target: '[data-tour="project-cards-container"]',
      title: 'Barra de Progresso',
      content:
        'Veja em tempo real o status e percentual de conclusão. Tarefas concluídas alimentam esta barra!',
      placement: 'top' as const,
    },
  ]

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      progress: 0,
      status: 'active',
      shared_with_users: [],
      shared_with_roles: [],
    },
  })

  const loadData = async () => {
    try {
      const [projectsData, usersData] = await Promise.all([getProjects(), getUsers()])
      setProjects(projectsData)
      setUsers(usersData.filter((u) => u.is_active !== false))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('projects', () => loadData())

  const uniqueJobTitles = useMemo(() => {
    return Array.from(new Set(users.map((u) => u.job_title).filter(Boolean))).sort()
  }, [users])

  const openModal = (p?: ProjectRecord) => {
    setEditing(p || null)

    const statusVal = p?.status ? (Array.isArray(p.status) ? p.status[0] : p.status) : 'active'

    form.reset(
      p
        ? {
            name: p.name,
            description: p.description || '',
            progress: p.progress || 0,
            status: statusVal as
              | 'active'
              | 'completed'
              | 'on_hold'
              | 'todo'
              | 'in_progress'
              | 'review'
              | 'done',
            color: p.color || '#3b82f6',
            shared_with_users: p.shared_with_users || [],
            shared_with_roles: p.shared_with_roles || [],
          }
        : {
            name: '',
            description: '',
            progress: 0,
            status: 'active',
            color: '#3b82f6',
            shared_with_users: [],
            shared_with_roles: [],
          },
    )
    setIsModalOpen(true)
  }

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      setIsSaving(true)
      const userId = user?.id || pb.authStore.record?.id
      if (!userId) throw new Error('Usuário não autenticado.')

      const payload = { ...values }

      if (editing) {
        await updateProject(editing.id, payload)
        toast({ title: 'Projeto atualizado com sucesso!' })
      } else {
        await createProject({ ...payload, created_by: userId })
        toast({ title: 'Projeto criado!' })
      }
      setIsModalOpen(false)
      loadData()
    } catch (error: any) {
      console.error('Project save error detailed:', error)
      if (error?.status === 400) {
        toast({
          title: 'Erro ao salvar: Verifique os dados informados.',
          variant: 'destructive',
        })
        const fieldErrors = extractFieldErrors(error)
        if (Object.keys(fieldErrors).length > 0) {
          Object.entries(fieldErrors).forEach(([field, msg]) => {
            form.setError(field as keyof ProjectFormValues, {
              type: 'server',
              message: msg as string,
            })
          })
        }
      } else {
        toast({
          title: 'Erro ao salvar',
          description: getErrorMessage(error),
          variant: 'destructive',
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Excluir projeto?')) return
    try {
      await deleteProject(id)
      toast({ title: 'Projeto excluído!' })
      loadData()
    } catch (error: unknown) {
      toast({
        title: 'Erro ao excluir',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    }
  }

  const colors: Record<string, string> = {
    active: 'bg-blue-500/20 text-blue-500',
    completed: 'bg-green-500/20 text-green-500',
    on_hold: 'bg-amber-500/20 text-amber-500',
    todo: 'bg-slate-500/20 text-slate-500',
    in_progress: 'bg-blue-500/20 text-blue-500',
    review: 'bg-purple-500/20 text-purple-500',
    done: 'bg-green-500/20 text-green-500',
  }
  const labels: Record<string, string> = {
    active: 'Ativo',
    completed: 'Concluído',
    on_hold: 'Em Espera',
    todo: 'A Fazer',
    in_progress: 'Em Andamento',
    review: 'Em Revisão',
    done: 'Finalizado',
  }

  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'mine') {
      const ownerId = getOwnerId(p.created_by)
      return ownerId === user?.id
    }
    if (activeTab === 'team') {
      if (filterUser === 'all') return true
      const ownerId = getOwnerId(p.created_by)
      return ownerId === filterUser
    }
    return true
  })

  const renderProjectsGrid = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-muted/20 animate-pulse border" />
          ))}
        </div>
      )
    }

    if (filteredProjects.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center glass-card rounded-3xl border-dashed border-2 py-12">
          <FolderKanban className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-semibold">Nenhum projeto encontrado</h3>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((p) => {
          const isAdmin = isAdminRole(role)
          const ownerId = getOwnerId(p.created_by)
          const isSharedWithUser = p.shared_with_users?.includes(user?.id || '')
          const isSharedWithRole =
            !!user?.job_title && p.shared_with_roles?.includes(user.job_title)
          let canEdit = isAdmin || ownerId === user?.id || isSharedWithUser || isSharedWithRole
          const isShared = ownerId !== user?.id && !isAdmin

          return (
            <Card
              key={p.id}
              onClick={() => {
                if (canEdit) openModal(p)
              }}
              className={`group relative glass-card rounded-3xl border-border/50 transition-all overflow-hidden ${
                canEdit ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md' : ''
              }`}
            >
              {canEdit && (
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label="Editar projeto"
                  className="absolute top-5 right-4 h-8 w-8 rounded-full z-10 bg-background/80 hover:bg-background shadow-sm backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    openModal(p)
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              <div className="h-2 w-full" style={{ backgroundColor: p.color || '#3b82f6' }} />
              <CardHeader className="pb-3 pt-4 pr-14">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold line-clamp-2">{p.name}</CardTitle>
                    {isShared && (
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 text-[9px] gap-1 bg-primary/10 text-primary border-primary/20 uppercase tracking-wider"
                      >
                        <Users className="w-3 h-3" />
                        Acesso Compartilhado
                      </Badge>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase border-none ${colors[p.status] || colors.active}`}
                  >
                    {labels[p.status] || p.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 text-xs mt-1 min-h-[32px]">
                  {p.description || 'Sem descrição'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="text-primary">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-2.5" />
              </CardContent>
              <CardFooter className="pt-0 flex justify-between items-center border-t border-border/30 mt-2 px-6 pt-4">
                <div className="flex items-center text-[11px] text-muted-foreground gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />{' '}
                  {format(new Date(p.created), "dd 'de' MMM", { locale: ptBR })}
                </div>
                <div className="flex gap-2">
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/20 rounded-full"
                      onClick={(e) => handleDelete(p.id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <PageTransition>
      <div
        className="h-full flex flex-col gap-6 p-4 md:p-6 overflow-y-auto custom-scrollbar"
        data-tour="project-cards-container"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3" data-tour="projects-header">
            <div className="p-3 bg-primary/20 rounded-2xl hidden md:flex shadow-sm">
              <FolderKanban className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">Trabalhos & Projetos</h1>
              <p className="text-sm text-muted-foreground mt-1">Acompanhe o progresso da equipe.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(role === 'admin' || role === 'ADMIN') && (
              <Button
                variant="outline"
                size="sm"
                onClick={startTour}
                className="rounded-xl border-primary/50 text-primary hover:bg-primary/10 hidden sm:flex h-10 px-3"
              >
                <Info className="w-4 h-4 mr-2" /> Como funciona
              </Button>
            )}
            <Button
              data-tour="projects-new"
              onClick={() => openModal()}
              className="rounded-xl h-10"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Projeto
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-1 flex flex-col"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList
              data-tour="projects-tabs"
              className="grid w-full sm:w-[400px] grid-cols-2 rounded-xl"
            >
              <TabsTrigger value="mine" className="rounded-lg">
                Meus Projetos
              </TabsTrigger>
              <TabsTrigger value="team" className="rounded-lg">
                Projetos da Equipe
              </TabsTrigger>
            </TabsList>

            {activeTab === 'team' && (
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger className="w-full sm:w-[250px] rounded-xl glass-card">
                  <SelectValue placeholder="Filtrar por colaborador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os colaboradores</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <TabsContent
            value="mine"
            className="m-0 flex-1 focus-visible:outline-none focus-visible:ring-0"
          >
            {renderProjectsGrid()}
          </TabsContent>
          <TabsContent
            value="team"
            className="m-0 flex-1 focus-visible:outline-none focus-visible:ring-0"
          >
            {renderProjectsGrid()}
          </TabsContent>
        </Tabs>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl glass-card p-0 overflow-hidden">
            <div className="p-6 pb-2">
              <DialogHeader>
                <DialogTitle>{editing ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
              </DialogHeader>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Tabs defaultValue="details" className="w-full">
                  <div className="px-6">
                    <TabsList className="grid w-full grid-cols-2 rounded-xl">
                      <TabsTrigger value="details" className="rounded-lg">
                        Detalhes
                      </TabsTrigger>
                      <TabsTrigger value="access" className="rounded-lg">
                        Compartilhamento
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6 pt-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <TabsContent value="details" className="m-0 space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nome do projeto"
                                className="rounded-xl"
                                {...field}
                              />
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
                              <Textarea
                                placeholder="Descrição do projeto"
                                className="rounded-xl h-20"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Ativo</SelectItem>
                                <SelectItem value="completed">Concluído</SelectItem>
                                <SelectItem value="on_hold">Em Espera</SelectItem>
                                <SelectItem value="todo">A Fazer</SelectItem>
                                <SelectItem value="in_progress">Em Andamento</SelectItem>
                                <SelectItem value="review">Em Revisão</SelectItem>
                                <SelectItem value="done">Finalizado</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="progress"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center pb-2">
                              <FormLabel>Progresso Manual</FormLabel>
                              <span className="font-bold text-primary">{field.value}%</span>
                            </div>
                            <FormControl>
                              <Slider
                                value={[field.value]}
                                onValueChange={(v) => field.onChange(v[0])}
                                max={100}
                                step={1}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor do Projeto</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-3">
                                <Input
                                  type="color"
                                  className="w-12 h-12 p-1 rounded-xl cursor-pointer"
                                  {...field}
                                  value={field.value || '#3b82f6'}
                                />
                                <Input
                                  type="text"
                                  placeholder="#000000"
                                  className="flex-1 rounded-xl uppercase"
                                  {...field}
                                  value={field.value || '#3b82f6'}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="access" className="m-0 space-y-5">
                      <div className="bg-primary/5 p-4 rounded-xl flex items-start gap-3 border border-primary/10">
                        <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-sm text-primary/80">
                          Projetos são privados por padrão. Os usuários e cargos selecionados abaixo
                          terão acesso de visualização a este projeto.
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="shared_with_users"
                        render={({ field }) => {
                          const availableUsers = users.filter(
                            (u) => u.id !== (user?.id || pb.authStore.record?.id),
                          )
                          const selectedUsers = availableUsers.filter((u) =>
                            field.value?.includes(u.id),
                          )
                          return (
                            <FormItem className="flex flex-col">
                              <FormLabel>Compartilhar com Colaboradores Específicos</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className={cn(
                                        'w-full justify-between rounded-xl font-normal',
                                        !field.value?.length && 'text-muted-foreground',
                                      )}
                                    >
                                      {field.value?.length > 0
                                        ? `${field.value.length} colaborador(es) selecionado(s)`
                                        : 'Selecione colaboradores...'}
                                      <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0" align="start">
                                  <Command>
                                    <CommandInput placeholder="Buscar colaborador..." />
                                    <CommandEmpty>Nenhum colaborador encontrado.</CommandEmpty>
                                    <CommandList>
                                      <CommandGroup>
                                        {availableUsers.map((u) => (
                                          <CommandItem
                                            key={u.id}
                                            value={u.name || u.email}
                                            onSelect={() => {
                                              const isSelected = field.value?.includes(u.id)
                                              if (isSelected) {
                                                field.onChange(
                                                  field.value.filter((id) => id !== u.id),
                                                )
                                              } else {
                                                field.onChange([...(field.value || []), u.id])
                                              }
                                            }}
                                          >
                                            <div
                                              className={cn(
                                                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                                field.value?.includes(u.id)
                                                  ? 'bg-primary text-primary-foreground'
                                                  : 'opacity-50 [&_svg]:invisible',
                                              )}
                                            >
                                              <Check className="h-4 w-4" />
                                            </div>
                                            <span>{u.name || u.email}</span>
                                            {u.job_title && (
                                              <span className="text-xs text-muted-foreground ml-2">
                                                ({u.job_title})
                                              </span>
                                            )}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {selectedUsers.map((u) => (
                                  <Badge
                                    key={u.id}
                                    variant="secondary"
                                    className="rounded-lg py-1 px-2 pr-1"
                                  >
                                    {u.name || u.email}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        field.onChange(field.value.filter((id) => id !== u.id))
                                      }
                                      className="ml-1 p-0.5 rounded-full hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />

                      <FormField
                        control={form.control}
                        name="shared_with_roles"
                        render={({ field }) => {
                          const selectedRoles = uniqueJobTitles.filter((r) =>
                            field.value?.includes(r),
                          )
                          return (
                            <FormItem className="flex flex-col">
                              <FormLabel>Compartilhar com Cargos (Departamentos)</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className={cn(
                                        'w-full justify-between rounded-xl font-normal',
                                        !field.value?.length && 'text-muted-foreground',
                                      )}
                                    >
                                      {field.value?.length > 0
                                        ? `${field.value.length} cargo(s) selecionado(s)`
                                        : 'Selecione cargos...'}
                                      <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0" align="start">
                                  <Command>
                                    <CommandInput placeholder="Buscar cargo..." />
                                    <CommandEmpty>Nenhum cargo encontrado.</CommandEmpty>
                                    <CommandList>
                                      <CommandGroup>
                                        {uniqueJobTitles.map((role) => (
                                          <CommandItem
                                            key={role}
                                            value={role}
                                            onSelect={() => {
                                              const isSelected = field.value?.includes(role)
                                              if (isSelected) {
                                                field.onChange(
                                                  field.value.filter((r) => r !== role),
                                                )
                                              } else {
                                                field.onChange([...(field.value || []), role])
                                              }
                                            }}
                                          >
                                            <div
                                              className={cn(
                                                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                                field.value?.includes(role)
                                                  ? 'bg-primary text-primary-foreground'
                                                  : 'opacity-50 [&_svg]:invisible',
                                              )}
                                            >
                                              <Check className="h-4 w-4" />
                                            </div>
                                            <span>{role}</span>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {selectedRoles.map((role) => (
                                  <Badge
                                    key={role}
                                    variant="secondary"
                                    className="rounded-lg py-1 px-2 pr-1"
                                  >
                                    {role}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        field.onChange(field.value.filter((r) => r !== role))
                                      }
                                      className="ml-1 p-0.5 rounded-full hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />
                    </TabsContent>
                  </div>
                </Tabs>

                <div className="p-6 pt-2">
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl"
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="rounded-xl" disabled={isSaving}>
                      {isSaving ? 'Salvando...' : editing ? 'Atualizar Projeto' : 'Criar Projeto'}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <GuideTour
          steps={tourSteps}
          open={tourOpen}
          onClose={closeTour}
          estimatedTime="2 minutos"
        />
      </div>
    </PageTransition>
  )
}
