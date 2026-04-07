import pb from '@/lib/pocketbase/client'

export const getUnreadNotifications = async (userId: string) => {
  return await pb.collection('notifications').getFullList({
    filter: `user = '${userId}' && is_read = false && is_archived = false`,
    sort: '-created',
    expand: 'sender',
  })
}

export const markNotificationAsRead = async (id: string) => {
  return await pb.collection('notifications').update(id, {
    is_read: true,
    read_at: new Date().toISOString(),
  })
}

export const archiveNotification = async (id: string) => {
  return await pb.collection('notifications').update(id, {
    is_archived: true,
  })
}

export const getNotifications = async (userId: string) => {
  return await pb.collection('notifications').getFullList({
    filter: `user = '${userId}' && is_archived = false`,
    sort: '-created',
    expand: 'sender',
  })
}

export const markAllNotificationsAsRead = async (userId: string) => {
  const unreadNotifications = await getUnreadNotifications(userId)
  const now = new Date().toISOString()

  const updatePromises = unreadNotifications.map((notif) =>
    pb.collection('notifications').update(notif.id, {
      is_read: true,
      read_at: now,
    }),
  )

  await Promise.all(updatePromises)
}
