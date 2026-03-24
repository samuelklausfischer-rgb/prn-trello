import pb from '@/lib/pocketbase/client'

export interface RankingRecord {
  id: string
  name: string
  avatar: string
  points: number
  level: number
  level_name?: string
  level_icon?: string
  position: number
}

export interface UserStatsRecord {
  id: string
  name: string
  points: number
  level: number
  streak_days: number
  total_tasks: number
  completed_tasks: number
  completion_rate: number
  xp: number
}

export const getRanking = async (): Promise<RankingRecord[]> => {
  const records = await pb.collection('users').getFullList({
    filter: 'is_active = true',
    sort: '-points',
  })

  return records.map((record, index) => ({
    id: record.id,
    name: record.name,
    avatar: record.avatar,
    points: record.points,
    level: record.level,
    position: index + 1,
  })) as RankingRecord[]
}

export const getUserStats = async (userId: string): Promise<UserStatsRecord> => {
  const user = await pb.collection('users').getOne(userId)

  const tasks = await pb.collection('tasks').getFullList({
    filter: `created_by = '${userId}' || delegated_to = '${userId}'`,
  })

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return {
    id: user.id,
    name: user.name,
    points: user.points,
    level: user.level,
    streak_days: user.streak_days,
    xp: user.xp,
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    completion_rate: completionRate,
  }
}
