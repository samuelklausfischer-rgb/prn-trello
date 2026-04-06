onRecordAfterUpdateSuccess((e) => {
  try {
    const newLevel = e.record.get('level') || 0
    const original = e.record.originalCopy()
    const oldLevel = original ? original.get('level') || 0 : 0

    if (newLevel > oldLevel) {
      const notifCol = $app.findCollectionByNameOrId('notifications')
      const notif = new Record(notifCol)
      notif.set('user', e.record.id)
      notif.set('title', 'Nível Alcançado!')
      notif.set(
        'message',
        `Parabéns! Você evoluiu para o Nível ${newLevel}. Continue o excelente trabalho!`,
      )
      notif.set('type', 'level_up')
      notif.set('action_url', `/profile`)
      notif.set('is_read', false)
      $app.saveNoValidate(notif)
    }
  } catch (err) {
    console.error('Error creating level up notification:', err)
  }
  e.next()
}, 'users')
