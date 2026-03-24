import pb from '@/lib/pocketbase/client'

export interface RankingRecord {
  id: string
  name: string
  avatar: string
  points: number
  level: number
  level_name: string
  level_icon: string
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
  const records = await pb.collection('v_ranking').getFullList<Omit<RankingRecord, 'position'>>({
    sort: '-points',
  })

  return records.map((record, index) => ({
    ...record,
    position: index + 1,
  })) as RankingRecord[]
}

export const getUserStats = async (userId: string): Promise<UserStatsRecord> => {
  return await pb.collection('v_user_stats').getOne<UserStatsRecord>(userId)
}
