import pb from '@/lib/pocketbase/client'

export const getUnreadNotifications = async (userId: string) => {
  return await pb.collection('notifications').getFullList({
    filter: `user = '${userId}' && is_read = false`,
    sort: '-created',
  })
}

export const markNotificationAsRead = async (id: string) => {
  return await pb.collection('notifications').update(id, {
    is_read: true,
    read_at: new Date().toISOString(),
  })
}
