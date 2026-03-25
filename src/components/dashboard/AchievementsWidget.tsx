import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Star, ShieldAlert, Award, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AchievementItem {
  id: string
  name: string
  description: string
  rarity: string
  progress: number
  target: number
  unlocked: boolean
  pointsReward: number
  xpReward: number
}

interface AchievementsWidgetProps {
  currentXp: number
  levelInfo: { level: number; minXp: number; maxXp: number } | null
  achievements: AchievementItem[]
}

const rarityColors: Record<string, string> = {
  common:
    'bg-slate-100/50 border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300',
  uncommon:
    'bg-green-100/50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400',
  rare: 'bg-blue-100/50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400',
  epic: 'bg-purple-100/50 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-400',
  legendary:
    'bg-amber-100/50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400',
}

export function AchievementsWidget({
  currentXp,
  levelInfo,
  achievements,
}: AchievementsWidgetProps) {
  const xpProgress = levelInfo
    ? Math.min(
        100,
        Math.max(0, ((currentXp - levelInfo.minXp) / (levelInfo.maxXp - levelInfo.minXp)) * 100),
      )
    : 0

  return (
    <Card className="glass-card border-white/20 dark:border-white/10 h-full flex flex-col">
      <CardHeader className="bg-muted/10 border-b border-border/50 pb-4 space-y-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="w-5 h-5 text-accent" />
          Seu Progresso & Conquistas
        </CardTitle>

        {levelInfo && (
          <div className="w-full space-y-2 bg-background/50 backdrop-blur-sm p-4 rounded-xl border border-border/50 shadow-sm">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">
                  Nível Atual
                </p>
                <p className="text-2xl font-extrabold text-foreground leading-none">
                  {levelInfo.level}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">
                  Próximo Nível
                </p>
                <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  {currentXp} / {levelInfo.maxXp} XP
                </p>
              </div>
            </div>
            <Progress value={xpProgress} className="h-2.5 mt-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-5 flex-1 overflow-auto">
        <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest mb-4">
          Conquistas Recentes
        </h4>
        <div className="space-y-3">
          {achievements.slice(0, 4).map((ach) => (
            <div
              key={ach.id}
              className={cn(
                'p-3.5 rounded-2xl border backdrop-blur-md transition-all duration-300 relative overflow-hidden',
                rarityColors[ach.rarity] || rarityColors.common,
                ach.unlocked ? 'opacity-100 shadow-sm hover-3d' : 'opacity-60 grayscale-[0.3]',
              )}
            >
              {ach.unlocked && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 dark:bg-black/10 rotate-45 transform translate-x-10 -translate-y-10 pointer-events-none mix-blend-overlay" />
              )}
              <div className="flex gap-3.5 items-start relative z-10">
                <div className="p-2.5 rounded-xl bg-background/60 backdrop-blur-md shadow-sm border border-white/20 shrink-0">
                  {ach.unlocked ? (
                    <Award className="w-6 h-6 text-accent drop-shadow-sm" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h5 className="font-bold text-sm line-clamp-1">{ach.name}</h5>
                    {ach.unlocked && (
                      <Badge
                        variant="outline"
                        className="bg-background/50 border-none text-[10px] py-0 h-4 uppercase tracking-wider font-bold"
                      >
                        Desbloqueado
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs font-medium opacity-80 line-clamp-1">{ach.description}</p>

                  {!ach.unlocked && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold opacity-70">
                        <span>Progresso</span>
                        <span>
                          {ach.progress} / {ach.target}
                        </span>
                      </div>
                      <Progress
                        value={(ach.progress / ach.target) * 100}
                        className="h-1.5 bg-background/50 border-none"
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-1.5">
                    {ach.xpReward > 0 && (
                      <span className="inline-flex items-center text-[10px] font-bold gap-0.5 bg-background/40 px-1.5 py-0.5 rounded border border-white/10">
                        <Zap className="w-3 h-3 text-primary" /> +{ach.xpReward} XP
                      </span>
                    )}
                    {ach.pointsReward > 0 && (
                      <span className="inline-flex items-center text-[10px] font-bold gap-0.5 bg-background/40 px-1.5 py-0.5 rounded border border-white/10">
                        <Star className="w-3 h-3 text-accent" /> +{ach.pointsReward} Pts
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {achievements.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Nenhuma conquista disponível.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
