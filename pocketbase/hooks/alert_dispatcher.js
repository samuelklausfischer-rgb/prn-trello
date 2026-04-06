onRecordCreate((e) => {
  const record = e.record
  if (record.get('is_sent') === true && !record.get('sent_at')) {
    try {
      const notifCol = $app.findCollectionByNameOrId('notifications')
      const targetUser = record.get('target_user')
      const targetRole = record.get('target_role')

      let userIds = []
      if (targetUser) {
        userIds.push(targetUser)
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

      if (userIds.length === 0) {
        throw new Error('Nenhum usuário encontrado para o público alvo selecionado.')
      }

      userIds.forEach((uid) => {
        const notif = new Record(notifCol)
        notif.set('user', uid)
        notif.set('alert', record.id)
        notif.set('title', record.get('title'))
        notif.set('message', record.get('message'))
        notif.set('type', record.get('type') || 'system')
        notif.set('action_url', record.get('action_url'))
        notif.set('is_read', false)
        $app.saveNoValidate(notif)
      })

      record.set('sent_at', new Date().toISOString())
    } catch (err) {
      throw new BadRequestError('Falha ao despachar notificações: ' + err.message)
    }
  }
  e.next()
}, 'alerts')

onRecordUpdate((e) => {
  const record = e.record
  if (record.get('is_sent') === true && !record.get('sent_at')) {
    try {
      const notifCol = $app.findCollectionByNameOrId('notifications')
      const targetUser = record.get('target_user')
      const targetRole = record.get('target_role')

      let userIds = []
      if (targetUser) {
        userIds.push(targetUser)
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

      userIds.forEach((uid) => {
        const notif = new Record(notifCol)
        notif.set('user', uid)
        notif.set('alert', record.id)
        notif.set('title', record.get('title'))
        notif.set('message', record.get('message'))
        notif.set('type', record.get('type') || 'system')
        notif.set('action_url', record.get('action_url'))
        notif.set('is_read', false)
        $app.saveNoValidate(notif)
      })

      record.set('sent_at', new Date().toISOString())
    } catch (err) {
      throw new BadRequestError('Falha ao despachar notificações: ' + err.message)
    }
  }
  e.next()
}, 'alerts')

cronAdd('process_scheduled_alerts', '*/1 * * * *', () => {
  const now = new Date().toISOString()
  const alerts = $app.findRecordsByFilter(
    'alerts',
    "is_sent = false && scheduled_for <= {:now} && scheduled_for != ''",
    '-created',
    100,
    0,
    { now: now },
  )

  alerts.forEach((record) => {
    record.set('is_sent', true)
    $app.save(record)
  })
})
