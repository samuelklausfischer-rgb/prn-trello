import { Bell, Medal, Flame, Star, Shield } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UserCardProps {
  user: any
  isAdmin?: boolean
  onNotify: (user: any) => void
}

export function UserCard({ user, isAdmin, onNotify }: UserCardProps) {
  return (
    <div
      className={cn(
        'glass-panel p-5 rounded-xl border flex flex-col gap-4 hover-3d transition-all shadow-sm',
        isAdmin
          ? 'border-primary/40 bg-primary/5 text-card-foreground'
          : 'border-border/50 bg-card text-card-foreground',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            className={cn(
              'h-12 w-12 border-2',
              isAdmin ? 'border-primary/40' : 'border-primary/20',
            )}
          >
            <AvatarImage src={user.avatar ? pb.files.getURL(user, user.avatar) : undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold line-clamp-1 flex items-center gap-1.5">
              {user.name || 'Sem nome'}
              {isAdmin && <Shield className="w-3.5 h-3.5 text-primary" />}
            </h3>
            {user.department && (
              <Badge variant={isAdmin ? 'default' : 'secondary'} className="mt-1 text-xs">
                {user.department}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'grid grid-cols-3 gap-2 py-3 border-y',
          isAdmin ? 'border-primary/10' : 'border-border/50',
        )}
      >
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50">
          <Star className="h-4 w-4 text-yellow-500 mb-1" />
          <span className="text-xs text-muted-foreground">Nível</span>
          <span className="font-bold">{user.level || 1}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50">
          <Medal className="h-4 w-4 text-blue-500 mb-1" />
          <span className="text-xs text-muted-foreground">XP</span>
          <span className="font-bold">{user.xp || 0}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50">
          <Flame className="h-4 w-4 text-orange-500 mb-1" />
          <span className="text-xs text-muted-foreground">Dias</span>
          <span className="font-bold">{user.streak_days || 0}</span>
        </div>
      </div>

      <button
        onClick={() => onNotify(user)}
        className="mt-auto inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-primary hover:text-primary-foreground h-10 px-4 py-2 gap-2 group"
      >
        <Bell className="h-4 w-4 group-hover:animate-shake" />
        Notificar
      </button>
    </div>
  )
}
