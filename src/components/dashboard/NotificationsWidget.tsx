import { Bell, CheckCircle2 } from 'lucide-react'
import { markNotificationAsRead } from '@/services/notifications'
import { toast } from 'sonner'
import { useState } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  created: string
}

interface NotificationsWidgetProps {
  notifications: Notification[]
  onRefresh: () => void
}

export function NotificationsWidget({ notifications, onRefresh }: NotificationsWidgetProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (notifications.length === 0) return null

  const handleMarkAsRead = async (id: string) => {
    try {
      setLoadingId(id)
      await markNotificationAsRead(id)
      onRefresh()
    } catch (error) {
      toast.error('Erro ao marcar como lida')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Não Lidas
        </h3>
        <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
          {notifications.length}
        </span>
      </div>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="p-3 bg-muted/50 rounded-lg flex flex-col gap-2 relative group hover:bg-muted transition-colors"
          >
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-medium text-sm leading-tight">{notif.title}</h4>
              <button
                onClick={() => handleMarkAsRead(notif.id)}
                disabled={loadingId === notif.id}
                className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                title="Marcar como lida"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
            <span className="text-[10px] text-muted-foreground/70 mt-1">
              {new Date(notif.created).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
