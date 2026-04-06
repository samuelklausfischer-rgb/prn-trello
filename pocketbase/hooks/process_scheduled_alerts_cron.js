cronAdd('process_scheduled_alerts', '*/1 * * * *', () => {
  const now = new Date().toISOString()

  try {
    const alerts = $app.findRecordsByFilter(
      'alerts',
      "is_sent = false && scheduled_for <= {:now} && scheduled_for != ''",
      '-created',
      100,
      0,
      { now: now },
    )

    const notifCol = $app.findCollectionByNameOrId('notifications')

    alerts.forEach((record) => {
      try {
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
              console.log(
                'Cron: Failed to create notification for user ' + uid + ': ' + err.message,
              )
            }
          })
        }

        // Updating record state natively saves it; onRecordUpdate will gracefully skip re-processing it
        // since we explicitly set sent_at here.
        record.set('is_sent', true)
        record.set('sent_at', now)
        $app.save(record)
      } catch (err) {
        console.log('Cron: Error processing alert ' + record.id + ': ' + err.message)
      }
    })
  } catch (err) {
    console.log('Cron: Error fetching scheduled alerts: ' + err.message)
  }
})
