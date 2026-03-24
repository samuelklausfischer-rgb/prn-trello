import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  getChecklistsByTask,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  ChecklistRecord,
} from '@/services/checklists'
import { useRealtime } from '@/hooks/use-realtime'
import useAuthStore from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'

export function TaskChecklist({ taskId }: { taskId: string }) {
  const [items, setItems] = useState<ChecklistRecord[]>([])
  const [newItemTitle, setNewItemTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  const loadItems = async () => {
    try {
      const data = await getChecklistsByTask(taskId)
      setItems(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadItems()
  }, [taskId])

  useRealtime('checklists', (e) => {
    if (e.record.task_id === taskId || e.record.task_id === undefined) {
      loadItems()
    }
  })

  const handleAdd = async () => {
    if (!newItemTitle.trim()) return
    const order = items.length > 0 ? Math.max(...items.map((i) => i.order || 0)) + 1 : 0

    setLoading(true)
    try {
      await createChecklist({
        task_id: taskId,
        title: newItemTitle.trim(),
        order,
        is_completed: false,
      })
      setNewItemTitle('')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (item: ChecklistRecord) => {
    try {
      const is_completed = !item.is_completed
      const completed_at = is_completed ? new Date().toISOString() : ''
      const completed_by = is_completed && user ? user.id : ''

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, is_completed, completed_at, completed_by } : i,
        ),
      )

      await updateChecklist(item.id, {
        is_completed,
        completed_at,
        completed_by,
      })
    } catch (e) {
      console.error(e)
      loadItems()
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setItems((prev) => prev.filter((i) => i.id !== id))
      await deleteChecklist(id)
    } catch (e) {
      console.error(e)
      loadItems()
    }
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-foreground">Checklist</h4>
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground italic">Nenhum item na checklist.</p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-2 group bg-muted/30 p-2 rounded-md border border-transparent hover:border-border transition-colors"
          >
            <Checkbox
              checked={item.is_completed}
              onCheckedChange={() => handleToggle(item)}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <span
                className={cn(
                  'text-sm block leading-tight',
                  item.is_completed && 'line-through text-muted-foreground',
                )}
              >
                {item.title}
              </span>
              {item.is_completed && item.expand?.completed_by && (
                <span className="text-[10px] text-muted-foreground block">
                  Concluído por {item.expand.completed_by.name}
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 -mt-0.5 shrink-0"
              onClick={() => handleDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Input
          placeholder="Adicionar sub-tarefa..."
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          className="h-9 text-sm"
          disabled={loading}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleAdd}
          disabled={!newItemTitle.trim() || loading}
          className="h-9"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>
    </div>
  )
}
