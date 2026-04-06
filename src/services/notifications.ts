import pb from '@/lib/pocketbase/client'

export const getNotifications = async (userId?: string) => {
  return await pb.collection('notifications').getFullList({
    sort: '-created',
    filter: userId ? `user = "${userId}"` : '',
  })
}

export const markNotificationAsRead = async (id: string) => {
  return await pb.collection('notifications').update(id, {
    is_read: true,
    read_at: new Date().toISOString(),
  })
}

export const markAllNotificationsAsRead = async (userId: string) => {
  const unread = await pb.collection('notifications').getFullList({
    filter: `user = "${userId}" && is_read = false`,
  })
  const promises = unread.map((n) =>
    pb
      .collection('notifications')
      .update(n.id, { is_read: true, read_at: new Date().toISOString() }),
  )
  await Promise.all(promises)
}
