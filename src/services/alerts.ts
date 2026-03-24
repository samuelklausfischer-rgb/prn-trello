import pb from '@/lib/pocketbase/client'

export const createAlert = async (data: any) => {
  return await pb.collection('alerts').create(data)
}

export const getAlerts = async () => {
  return await pb.collection('alerts').getFullList({
    sort: '-created',
  })
}
