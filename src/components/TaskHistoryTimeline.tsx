import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Activity, ArrowRightLeft, CheckCircle2, CheckSquare, Plus, UserPlus } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface HistoryRecord {
  id: string
  action: string
  description: string
  old_value: string
  new_value: string
  performed_at: string
  expand?: {
    performed_by?: { name: string; avatar: string }
  }
}

const getIcon = (action: string) => {
  switch (action) {
    case 'TASK_CREATED':
      return <Plus className="h-4 w-4 text-emerald-500" />
    case 'STATUS_CHANGED':
      return <ArrowRightLeft className="h-4 w-4 text-blue-500" />
    case 'DELEGATED':
      return <UserPlus className="h-4 w-4 text-purple-500" />
    case 'CHECKLIST_COMPLETED':
      return <CheckSquare className="h-4 w-4 text-orange-500" />
    case 'TASK_COMPLETED':
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />
  }
}

export function TaskHistoryTimeline({ taskId }: { taskId: string }) {
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadHistory = async () => {
    try {
      const records = await pb.collection('task_history').getFullList<HistoryRecord>({
        filter: `task_id = "${taskId}"`,
        sort: '-performed_at',
        expand: 'performed_by',
      })
      setHistory(records)
    } catch (e) {
      console.error('Failed to load history', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [taskId])

  useRealtime('task_history', (e) => {
    if (e.record.task_id === taskId) {
      loadHistory()
    }
  })

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
        Carregando histórico...
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Nenhum histórico registrado.
      </div>
    )
  }

  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:ml-[1.125rem] before:h-full before:w-0.5 before:bg-border pb-4">
      {history.map((item) => {
        const user = item.expand?.performed_by
        return (
          <div key={item.id} className="relative flex items-start gap-4 animate-fade-in-up">
            <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full border-4 border-background bg-muted z-10 shrink-0 shadow-sm">
              {getIcon(item.action)}
            </div>
            <div className="flex-1 border rounded-lg p-3 bg-card shadow-sm text-sm mt-0.5 group hover:border-border transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user?.avatar ? pb.files.getURL(user, user.avatar) : ''} />
                    <AvatarFallback className="text-[10px]">
                      {user?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{user?.name || 'Sistema'}</span>
                </div>
                <time className="text-[11px] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(item.performed_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </time>
              </div>
              <p className="text-muted-foreground mt-1.5">{item.description}</p>
              {item.old_value && item.new_value && (
                <div className="mt-2 text-[11px] bg-muted/40 p-2 rounded flex flex-wrap items-center gap-2 border border-transparent group-hover:border-border transition-colors">
                  <span className="text-muted-foreground line-through decoration-muted-foreground/50">
                    {item.old_value}
                  </span>
                  <ArrowRightLeft className="h-3 w-3 text-muted-foreground/70" />
                  <span className="font-medium text-foreground">{item.new_value}</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
