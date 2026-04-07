import { useState, useEffect } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Plus, FolderKanban, Pencil, Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

export default function Projects() {
  const { user, role } = useAuth()
  const { toast } = useToast()
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProjectRecord | null>(null)
  const [form, setForm] = useState({ name: '', description: '', progress: 0, status: 'active' })

  const loadData = async () => {
    try {
      setProjects(await getProjects())
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

  const openModal = (p?: ProjectRecord) => {
    setEditing(p || null)
    setForm(
      p
        ? {
            name: p.name,
            description: p.description || '',
            progress: p.progress || 0,
            status: p.status || 'active',
          }
        : { name: '', description: '', progress: 0, status: 'active' },
    )
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return toast({ title: 'Nome obrigatório', variant: 'destructive' })
    try {
      if (editing) await updateProject(editing.id, form)
      else if (user?.id) await createProject({ ...form, created_by: user.id } as any)
      toast({ title: editing ? 'Projeto atualizado!' : 'Projeto criado!' })
      setIsModalOpen(false)
      loadData()
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Excluir projeto?')) return
    try {
      await deleteProject(id)
      toast({ title: 'Projeto excluído!' })
      loadData()
    } catch (error: any) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
    }
  }

  const colors: Record<string, string> = {
    active: 'bg-blue-500/20 text-blue-500',
    completed: 'bg-green-500/20 text-green-500',
    on_hold: 'bg-amber-500/20 text-amber-500',
  }
  const labels: Record<string, string> = {
    active: 'Em Andamento',
    completed: 'Concluído',
    on_hold: 'Pausado',
  }

  return (
    <PageTransition>
      <div className="h-full flex flex-col gap-6 p-4 md:p-6 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-2xl hidden md:flex shadow-sm">
              <FolderKanban className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">Trabalhos & Projetos</h1>
              <p className="text-sm text-muted-foreground mt-1">Acompanhe o progresso da equipe.</p>
            </div>
          </div>
          <Button onClick={() => openModal()} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Novo Projeto
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-muted/20 animate-pulse border" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center glass-card rounded-3xl border-dashed border-2">
            <FolderKanban className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold">Nenhum projeto encontrado</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <Card
                key={p.id}
                className="group glass-card rounded-3xl border-border/50 hover:-translate-y-1 transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-bold line-clamp-2">{p.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase border-none ${colors[p.status]}`}
                    >
                      {labels[p.status]}
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
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => openModal(p)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {(role === 'ADMIN' || p.created_by === user?.id) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive rounded-full"
                        onClick={(e) => handleDelete(p.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl glass-card">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="rounded-xl h-20"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="on_hold">Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <Label>Progresso Manual</Label>
                  <span className="font-bold text-primary">{form.progress}%</span>
                </div>
                <Slider
                  value={[form.progress]}
                  onValueChange={(v) => setForm({ ...form, progress: v[0] })}
                  max={100}
                  step={1}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} className="rounded-xl">
                {editing ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}
