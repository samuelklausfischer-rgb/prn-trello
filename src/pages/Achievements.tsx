import { useEffect, useState, useMemo } from 'react'
import {
  getAchievements,
  getUserAchievements,
  Achievement,
  UserAchievement,
} from '@/services/achievements'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/useAuthHooks'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Trophy,
  CheckCircle2,
  Flame,
  Star,
  Target,
  Zap,
  Award,
  Crown,
  Medal,
  Eye,
  FileCheck,
  FileText,
  Send,
  ShieldCheck,
  Briefcase,
  Layers,
  Keyboard,
  AlignLeft,
  Crosshair,
  Save,
  Database,
  Edit3,
  Archive,
  Command,
  CheckSquare,
  Library,
  Coins,
  Table,
  Receipt,
  FileCheck2,
  PhoneCall,
  ThumbsUp,
  Percent,
  TrendingUp,
  Search,
  Landmark,
  Wand2,
  Activity,
  Bug,
  BookOpen,
  Server,
  Link,
  Bot,
  ScanFace,
  Cpu,
  Phone,
  Clock,
  Smile,
  Mail,
  MessageCircle,
  CalendarDays,
  PenTool,
  UserPlus,
  BarChart,
  Rocket,
} from 'lucide-react'

const iconMap: Record<string, any> = {
  Trophy,
  CheckCircle2,
  Flame,
  Star,
  Target,
  Zap,
  Award,
  Crown,
  Medal,
  Eye,
  FileCheck,
  FileText,
  Send,
  ShieldCheck,
  Briefcase,
  Layers,
  Keyboard,
  AlignLeft,
  Crosshair,
  Save,
  Database,
  Edit3,
  Archive,
  Command,
  CheckSquare,
  Library,
  Coins,
  Table,
  Receipt,
  FileCheck2,
  PhoneCall,
  ThumbsUp,
  Percent,
  TrendingUp,
  Search,
  Landmark,
  Wand2,
  Activity,
  Bug,
  BookOpen,
  Server,
  Link,
  Bot,
  ScanFace,
  Cpu,
  Phone,
  Clock,
  Smile,
  Mail,
  MessageCircle,
  CalendarDays,
  PenTool,
  UserPlus,
  BarChart,
  Rocket,
}

const rarityColors: Record<string, string> = {
  common: 'bg-slate-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-orange-500',
}

const categoryLabels: Record<string, string> = {
  all: 'Todas',
  tasks: 'Tarefas',
  checklists: 'Checklists',
  streak: 'Sequência',
  licitacao: 'Licitação',
  digitadora: 'Digitadora',
  financas: 'Finanças',
  engenharia_ia: 'Engenharia IA',
  comercial: 'Comercial',
  milestone: 'Marcos',
  collaboration: 'Colaboração',
}

export default function Achievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchs, setUserAchs] = useState<Record<string, UserAchievement>>({})
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    if (!user) return
    Promise.all([getAchievements(), getUserAchievements(user.id)])
      .then(([achs, uAchs]) => {
        setAchievements(achs)
        setUserAchs(uAchs.reduce((acc, curr) => ({ ...acc, [curr.achievement_id]: curr }), {}))
        setLoading(false)
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchData()
  }, [user])

  useRealtime(
    'user_achievements',
    () => {
      fetchData()
    },
    !!user,
  )

  const categories = useMemo(() => {
    const cats = Array.from(new Set(achievements.map((a) => a.category))).sort()
    return ['all', ...cats]
  }, [achievements])

  if (loading)
    return (
      <div className="p-8 flex justify-center text-muted-foreground">Carregando conquistas...</div>
    )

  const renderGrid = (items: Achievement[]) => {
    if (items.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Nenhuma conquista configurada no sistema ainda.</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {items.map((ach) => {
          const Icon = iconMap[ach.icon] || Trophy
          const ua = userAchs[ach.id]
          const progress = ua?.progress || 0
          const isUnlocked = !!ua?.unlocked_at
          const percent = Math.min(
            100,
            Math.round((progress / Math.max(ach.requirement_value, 1)) * 100),
          )

          return (
            <Card
              key={ach.id}
              className={`transition-all duration-300 relative overflow-hidden group ${isUnlocked ? 'border-primary/30 shadow-md hover:shadow-lg' : 'opacity-70 hover:opacity-90 grayscale-[40%] hover:grayscale-0'}`}
            >
              {isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              )}
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0 relative z-10">
                <div
                  className={`p-3 rounded-xl transition-transform group-hover:scale-105 ${isUnlocked ? 'bg-opacity-20 shadow-inner' : 'bg-muted'}`}
                  style={{
                    backgroundColor: isUnlocked ? `${ach.badge_color || '#888'}33` : undefined,
                    color: isUnlocked ? ach.badge_color : 'hsl(var(--muted-foreground))',
                  }}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <Badge
                  className={`${rarityColors[ach.rarity] || rarityColors.common} text-white border-0 shadow-sm text-[10px] uppercase font-bold tracking-wider px-2 py-0.5`}
                >
                  {ach.rarity}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div>
                  <CardTitle className="text-lg leading-tight">{ach.name}</CardTitle>
                  <CardDescription className="text-xs mt-1.5 min-h-[32px] line-clamp-2">
                    {ach.description}
                  </CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-semibold tracking-wide">
                    <span className={isUnlocked ? 'text-primary' : 'text-muted-foreground'}>
                      {isUnlocked ? 'CONCLUÍDO' : `${progress} / ${ach.requirement_value}`}
                    </span>
                    <span className="text-muted-foreground">{percent}%</span>
                  </div>
                  <Progress value={percent} className="h-2 bg-secondary" />
                </div>
                <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-muted-foreground/80 border-t border-border/50">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-500" /> +{ach.xp_reward} XP
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> +{ach.points_reward} Pts
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Medal className="w-8 h-8 text-amber-500" /> Galeria de Conquistas
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Cumpra objetivos para desbloquear recompensas e ganhar pontos de experiência.
        </p>
      </div>
      <Tabs defaultValue="all" className="w-full">
        <ScrollArea className="w-full pb-3 mb-4 border-b border-border/40">
          <TabsList className="inline-flex w-max items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="px-4 py-1.5 text-sm font-medium transition-all capitalize"
              >
                {categoryLabels[cat] || cat}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
        {categories.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-0 focus-visible:outline-none">
            {renderGrid(
              cat === 'all' ? achievements : achievements.filter((a) => a.category === cat),
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
