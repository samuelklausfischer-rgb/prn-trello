import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Award } from 'lucide-react'
import { UserAchievement } from '@/services/achievements'
import { cn } from '@/lib/utils'

export function AchievementsTab({ achievements }: { achievements: UserAchievement[] }) {
  return (
    <div className="animate-fade-in-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievements.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-background/40 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Nenhuma conquista encontrada.</p>
          </div>
        ) : (
          achievements.map((ua) => {
            const ach = ua.expand?.achievement_id
            if (!ach) return null
            const isUnlocked = !!ua.unlocked_at

            return (
              <Card
                key={ua.id}
                className={cn(
                  'bg-background/60 backdrop-blur-md border-border/50 shadow-sm transition-all duration-300',
                  !isUnlocked && 'opacity-70 grayscale hover:grayscale-0 hover:opacity-100',
                )}
              >
                <CardContent className="p-5 flex flex-col items-center text-center h-full relative overflow-hidden">
                  <div
                    className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center mb-3 text-3xl shadow-inner',
                      isUnlocked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {ach.icon || '🏅'}
                  </div>

                  <h3 className="font-bold text-foreground mb-1 leading-tight">{ach.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-grow">
                    {ach.description}
                  </p>

                  {ach.requirement_value > 1 && (
                    <div className="w-full mt-auto relative z-20">
                      <div className="flex justify-between text-[10px] mb-1 font-medium">
                        <span>{ua.progress}</span>
                        <span>{ach.requirement_value}</span>
                      </div>
                      <Progress
                        value={Math.min(100, (ua.progress / ach.requirement_value) * 100)}
                        className="h-1.5"
                      />
                    </div>
                  )}

                  {isUnlocked && (
                    <Badge
                      variant="default"
                      className="mt-3 w-full justify-center bg-primary/20 text-primary hover:bg-primary/30 border-none shadow-none"
                    >
                      Desbloqueada
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
