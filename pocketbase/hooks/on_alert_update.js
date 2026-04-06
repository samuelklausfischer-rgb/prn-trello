onRecordUpdate((e) => {
  const record = e.record

  // If the record has already been sent, do not process it again
  if (record.get('sent_at')) {
    e.next()
    return
  }

  const scheduledFor = record.get('scheduled_for')
  const isSent = record.get('is_sent') === true
  const now = new Date().toISOString()

  const isImmediate = !scheduledFor || scheduledFor <= now

  if (isImmediate || isSent) {
    try {
      const notifCol = $app.findCollectionByNameOrId('notifications')
      const targetUser = record.get('target_user')
      const targetRole = record.get('target_role')

      let userIds = []
      if (targetUser && targetUser.length > 0) {
        if (Array.isArray(targetUser)) {
          userIds.push(...targetUser)
        } else {
          userIds.push(targetUser)
        }
      } else if (targetRole) {
        const users = $app.findRecordsByFilter(
          'users',
          'role = {:role} && is_active = true',
          '-created',
          1000,
          0,
          { role: targetRole },
        )
        users.forEach((u) => userIds.push(u.id))
      } else {
        const users = $app.findRecordsByFilter('users', 'is_active = true', '-created', 1000, 0)
        users.forEach((u) => userIds.push(u.id))
      }

      userIds = [...new Set(userIds)]

      if (userIds.length > 0) {
        userIds.forEach((uid) => {
          try {
            const notif = new Record(notifCol)
            notif.set('user', uid)
            notif.set('alert', record.id)
            notif.set('title', record.get('title'))
            notif.set('message', record.get('message'))
            notif.set('type', record.get('type') || 'system')
            notif.set('action_url', record.get('action_url'))
            notif.set('is_read', false)
            $app.saveNoValidate(notif)
          } catch (err) {
            console.log('Failed to create notification for user ' + uid + ': ' + err.message)
          }
        })
      }

      record.set('is_sent', true)
      record.set('sent_at', now)
    } catch (err) {
      console.log('Error in on_alert_update dispatch logic: ' + err.message)
    }
  }

  e.next()
}, 'alerts')
