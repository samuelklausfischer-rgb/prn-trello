import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RankingItem {
  id: string
  name: string
  avatar: string
  points: number
  level: number
  position: number
}

export function TeamRankingWidget({ ranking }: { ranking: RankingItem[] }) {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
      case 2:
        return <Medal className="w-5 h-5 text-slate-400 fill-slate-300" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-700 fill-amber-700/50" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">{position}º</span>
    }
  }

  return (
    <Card className="shadow-sm border border-border h-full flex flex-col">
      <CardHeader className="bg-muted/20 border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-amber-500" />
          Ranking da Equipe
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        <div className="divide-y divide-border">
          {ranking.slice(0, 10).map((user) => (
            <div
              key={user.id}
              className={cn(
                'p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors',
                user.position === 1 && 'bg-amber-500/5 dark:bg-amber-500/10',
              )}
            >
              <div className="flex items-center justify-center w-8 shrink-0">
                {getPositionIcon(user.position)}
              </div>
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="font-semibold bg-primary/10 text-primary">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground font-medium">Nível {user.level}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-accent">{user.points} pts</p>
              </div>
            </div>
          ))}
          {ranking.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Nenhum dado de ranking disponível.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
