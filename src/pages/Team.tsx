import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Star } from 'lucide-react'

export default function Team() {
  const mockTeam = [
    {
      id: '1',
      name: 'João Silva',
      points: 1250,
      level: 3,
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
    },
    {
      id: '2',
      name: 'Maria Oliveira',
      points: 980,
      level: 2,
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=2',
    },
    {
      id: '3',
      name: 'Carlos Souza',
      points: 840,
      level: 2,
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3',
    },
    {
      id: '4',
      name: 'Ana Costa',
      points: 420,
      level: 1,
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=4',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up py-4">
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

      <div className="grid gap-5">
        {mockTeam.map((user, index) => (
          <Card
            key={user.id}
            className={`transform transition-all duration-300 hover:shadow-md ${index === 0 ? 'border-2 border-accent shadow-lg bg-accent/[0.02]' : 'border border-border/60 hover:scale-[1.01]'}`}
          >
            <CardContent className="p-5 flex items-center gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-10 text-center font-bold text-xl text-muted-foreground flex items-center justify-center">
                {index === 0 ? (
                  <Medal className="w-10 h-10 text-accent drop-shadow-sm" />
                ) : (
                  `#${index + 1}`
                )}
              </div>

              <Avatar
                className={`h-14 w-14 sm:h-16 sm:w-16 shadow-sm border-2 ${index === 0 ? 'border-accent' : 'border-background'}`}
              >
                <AvatarImage src={user.avatar} />
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
  )
}
