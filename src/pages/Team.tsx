import { SYSTEM_USERS } from '@/stores/useAuthStore'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Star } from 'lucide-react'
import PageTransition from '@/components/PageTransition'

export default function Team() {
  // Score Ranking logic based on actual mock data, sorted by points
  const sortedTeam = [...SYSTEM_USERS]
    .filter((u) => u.role !== 'ADMIN') // Typically admins might not be in the competitive ranking
    .sort((a, b) => b.points - a.points)

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        <div className="flex items-center gap-4 mb-8 bg-card p-6 rounded-2xl shadow-subtle border border-border/50">
          <div className="bg-accent/10 p-4 rounded-2xl">
            <Trophy className="w-10 h-10 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Ranking da Equipe</h1>
            <p className="text-muted-foreground text-lg">
              Acompanhe quem está liderando a produtividade da empresa!
            </p>
          </div>
        </div>

        <div className="grid gap-5 pb-8">
          {sortedTeam.map((user, index) => (
            <Card
              key={user.id}
              className={`transform transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
                index === 0
                  ? 'border-2 border-accent shadow-lg bg-accent/[0.02]'
                  : 'border border-border/60'
              }`}
            >
              <CardContent className="p-5 flex items-center gap-4 sm:gap-6">
                <div className="flex-shrink-0 w-10 text-center font-bold text-xl text-muted-foreground flex items-center justify-center">
                  {index === 0 ? (
                    <Medal className="w-10 h-10 text-accent drop-shadow-sm animate-bounce-in" />
                  ) : (
                    `#${index + 1}`
                  )}
                </div>

                <Avatar
                  className={`h-14 w-14 sm:h-16 sm:w-16 shadow-sm border-2 ${
                    index === 0 ? 'border-accent' : 'border-background'
                  }`}
                >
                  <AvatarImage src={user.avatar} alt={`Avatar de ${user.name}`} />
                  <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="font-bold text-lg sm:text-xl text-foreground">{user.name}</h3>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Star
                      className={`w-4 h-4 ${index === 0 ? 'text-accent fill-accent' : 'text-muted-foreground'}`}
                    />
                    Nível {user.level}
                  </p>
                </div>

                <div className="text-right bg-background px-4 py-2 rounded-xl shadow-sm border border-border/50">
                  <span
                    className={`text-2xl sm:text-3xl font-bold ${index === 0 ? 'text-accent' : 'text-primary'}`}
                  >
                    {user.points}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-muted-foreground ml-1 uppercase tracking-wide">
                    pts
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
