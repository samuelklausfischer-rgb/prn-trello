import { useEffect } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/useAuthHooks'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { Trophy } from 'lucide-react'

export default function AchievementNotifier() {
  const { user } = useAuth()

  useRealtime(
    'user_achievements',
    (e) => {
      if (!user) return

      if ((e.action === 'update' || e.action === 'create') && e.record.user_id === user.id) {
        if (e.record.unlocked_at && !e.record.is_notified) {
          pb.collection('achievements')
            .getOne(e.record.achievement_id)
            .then((ach) => {
              toast({
                title: 'Conquista Desbloqueada! 🏆',
                description: `Parabéns! Você desbloqueou: ${ach.name}. Recompensa: ${ach.points_reward} pts.`,
              })

              pb.collection('user_achievements')
                .update(e.record.id, { is_notified: true })
                .catch(console.error)
            })
            .catch(console.error)
        }
      }
    },
    !!user,
  )

  return null
}
