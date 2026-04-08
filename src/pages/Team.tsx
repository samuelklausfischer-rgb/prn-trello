import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Medal, Star, Briefcase } from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'
import { GuideTour, useTour } from '@/components/GuideTour'

export default function Team() {
  const [team, setTeam] = useState<RecordModel[]>([])

  const { open: tourOpen, closeTour } = useTour('team')
  const tourSteps = [
    {
      target: '[data-tour="team-header"]',
      title: 'Ranking da Equipe',
      content:
        'Veja quem está liderando a produtividade. Tarefas complexas rendem mais pontos e XP!',
      placement: 'bottom' as const,
    },
    {
      target: '[data-tour="team-leaderboard"]',
      title: 'Lógica de Pontuação',
      content:
        'A cada tarefa concluída, você ganha Pontos e XP. O XP eleva seu Nível, e os Pontos definem sua posição aqui.',
      placement: 'top' as const,
      image: 'https://img.usecurling.com/p/400/200?q=trophy%20points&color=orange',
    },
  ]
  const [loading, setLoading] = useState(true)

  const fetchTeam = async () => {
    try {
      const data = await pb.collection('users').getFullList({
        sort: '-points',
      })
      setTeam(data)
    } catch (error) {
      console.error('Error fetching team:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [])

  useRealtime('users', () => {
    fetchTeam()
  })

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-8 py-4 px-4 sm:px-0">
        <GuideTour
          steps={tourSteps}
          open={tourOpen}
          onClose={closeTour}
          estimatedTime="1-2 minutos"
        />
        <div
          data-tour="team-header"
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 bg-card p-6 rounded-2xl shadow-subtle border border-border/50 transition-colors duration-300"
        >
          <div className="bg-accent/10 p-4 rounded-2xl shrink-0">
            <Trophy className="w-10 h-10 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary dark:text-foreground tracking-tight">
              Ranking da Equipe
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Acompanhe quem está liderando a produtividade da empresa!
            </p>
          </div>
        </div>

        <div data-tour="team-leaderboard" className="grid gap-4 pb-8">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border border-border/60">
                <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-6">
                  <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0" />
                  <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-10 w-16 sm:h-12 sm:w-20 rounded-xl shrink-0" />
                </CardContent>
              </Card>
            ))
          ) : team.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground bg-card rounded-2xl border border-border/50">
              Nenhum membro da equipe encontrado.
            </div>
          ) : (
            team.map((user, index) => {
              const avatarUrl = user.avatar ? pb.files.getURL(user, user.avatar) : ''
              const initial = user.name ? user.name.charAt(0).toUpperCase() : '?'

              return (
                <Card
                  key={user.id}
                  className={`transform transition-all duration-300 hover:shadow-md hover:scale-[1.01] dark:hover:brightness-110 ${
                    index === 0
                      ? 'border-2 border-accent shadow-lg bg-accent/[0.02]'
                      : 'border border-border/60'
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-6">
                    <div className="flex-shrink-0 w-8 sm:w-10 text-center font-bold text-lg sm:text-xl text-muted-foreground flex items-center justify-center">
                      {index === 0 ? (
                        <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-accent drop-shadow-sm animate-bounce-in" />
                      ) : (
                        `#${index + 1}`
                      )}
                    </div>

                    <Avatar
                      className={`h-12 w-12 sm:h-16 sm:w-16 shadow-sm border-2 shrink-0 ${
                        index === 0 ? 'border-accent' : 'border-background'
                      }`}
                    >
                      <AvatarImage src={avatarUrl} alt={`Avatar de ${user.name}`} />
                      <AvatarFallback className="text-base sm:text-lg font-bold bg-primary/10 text-primary">
                        {initial}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <h3 className="font-bold text-base sm:text-lg text-foreground truncate">
                          {user.name || 'Sem nome'}
                        </h3>
                        {user.job_title && (
                          <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full w-fit whitespace-nowrap flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {user.job_title}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 mt-0.5 sm:mt-1">
                        <Star
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${index === 0 ? 'text-accent fill-accent' : 'text-muted-foreground'}`}
                        />
                        Nível {user.level || 0}
                        <span className="hidden sm:inline"> • {user.xp || 0} XP</span>
                      </p>
                    </div>

                    <div className="text-right bg-background px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-sm border border-border/50 shrink-0">
                      <span
                        className={`text-xl sm:text-3xl font-bold ${
                          index === 0 ? 'text-accent' : 'text-primary dark:text-foreground'
                        }`}
                      >
                        {user.points || 0}
                      </span>
                      <span className="text-[10px] sm:text-sm font-semibold text-muted-foreground ml-1 uppercase tracking-wide">
                        pts
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </PageTransition>
  )
}
