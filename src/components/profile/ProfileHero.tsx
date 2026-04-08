import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Trophy, Flame, Pencil } from 'lucide-react'

export function ProfileHero({ user, onEdit }: { user: any; onEdit: () => void }) {
  return (
    <Card className="bg-background/60 backdrop-blur-md border-border/50 shadow-lg overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-primary/60 to-accent/60 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="absolute top-4 right-4 bg-background/20 hover:bg-background/40 text-white backdrop-blur-md border border-white/20"
        >
          <Pencil className="w-4 h-4 mr-2" /> Editar
        </Button>
      </div>
      <CardContent className="pt-0 px-6 pb-6 text-center relative">
        <Avatar className="w-28 h-28 border-4 border-background mx-auto -mt-14 bg-background shadow-xl">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
            {user.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold mt-4 text-foreground">{user.name}</h2>
        {user.job_title && (
          <p className="text-md font-medium text-primary mt-1">{user.job_title}</p>
        )}

        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <StatBox icon={Star} iconColor="text-amber-500" value={user.level || 1} label="Nível" />
          <StatBox icon={Trophy} iconColor="text-primary" value={user.points || 0} label="Pontos" />
          <StatBox
            icon={Flame}
            iconColor="text-orange-500"
            value={user.streak_days || 0}
            label="Dias Seguidos"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function StatBox({ icon: Icon, iconColor, value, label }: any) {
  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-background/40 border border-border/30 min-w-[100px]">
      <Icon className={`w-6 h-6 mb-1 ${iconColor}`} />
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  )
}
