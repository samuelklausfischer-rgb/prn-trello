import pb from '@/lib/pocketbase/client'

export type PointHistory = {
  id: string
  user_id: string
  points: number
  reason: string
  source_type: string
  source_id?: string
  balance_after: number
  created: string
}

export type Level = {
  id: string
  level_number: number
  name: string
  min_xp: number
  max_xp: number
  icon?: string
  color?: string
}

export const getPointsHistory = async (userId: string): Promise<PointHistory[]> => {
  return pb.collection('points_history').getFullList({
    filter: `user_id = '${userId}'`,
    sort: '-created',
  })
}

export const getLevels = async (): Promise<Level[]> => {
  return pb.collection('levels').getFullList({
    sort: 'level_number',
  })
}
