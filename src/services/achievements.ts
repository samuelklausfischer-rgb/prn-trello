import pb from '@/lib/pocketbase/client'

export interface Achievement {
  id: string
  name: string
  slug: string
  description: string
  category:
    | 'tasks'
    | 'checklists'
    | 'streak'
    | 'collaboration'
    | 'milestone'
    | 'licitacao'
    | 'digitadora'
    | 'financas'
    | 'engenharia_ia'
    | 'comercial'
  icon: string
  requirement_type: string
  requirement_value: number
  points_reward: number
  xp_reward: number
  badge_color: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  is_active: boolean
  is_hidden: boolean
  created: string
  updated: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  progress: number
  progress_target: number
  unlocked_at: string | null
  is_notified: boolean
  created: string
  updated: string
  expand?: {
    achievement_id: Achievement
  }
}

export const getAchievements = () =>
  pb
    .collection('achievements')
    .getFullList<Achievement>({ filter: 'is_active = true', sort: 'requirement_value' })

export const getUserAchievements = (userId: string) =>
  pb
    .collection('user_achievements')
    .getFullList<UserAchievement>({ filter: `user_id = "${userId}"`, expand: 'achievement_id' })

export const markAchievementNotified = (id: string) =>
  pb.collection('user_achievements').update<UserAchievement>(id, { is_notified: true })
