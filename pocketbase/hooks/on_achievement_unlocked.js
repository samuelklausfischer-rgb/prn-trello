onRecordAfterCreateSuccess((e) => {
  try {
    const progress = e.record.get('progress') || 0
    const target = e.record.get('progress_target') || 1
    const isUnlocked = progress >= target || e.record.get('unlocked_at')

    if (isUnlocked && !e.record.get('is_notified')) {
      const achievement = $app.findRecordById('achievements', e.record.get('achievement_id'))
      const notifCol = $app.findCollectionByNameOrId('notifications')
      const notif = new Record(notifCol)
      notif.set('user', e.record.get('user_id'))
      notif.set('title', 'Conquista Desbloqueada!')
      notif.set('message', `Você desbloqueou: ${achievement.get('name')}`)
      notif.set('type', 'achievement')
      notif.set('action_url', `/achievements`)
      notif.set('is_read', false)
      $app.saveNoValidate(notif)

      e.record.set('is_notified', true)
      $app.saveNoValidate(e.record)
    }
  } catch (err) {
    console.error('Error creating achievement notification:', err)
  }
  e.next()
}, 'user_achievements')

onRecordAfterUpdateSuccess((e) => {
  try {
    const progress = e.record.get('progress') || 0
    const target = e.record.get('progress_target') || 1
    const isUnlocked = progress >= target || e.record.get('unlocked_at')

    const original = e.record.originalCopy()
    const oldProgress = original ? original.get('progress') || 0 : 0
    const wasUnlocked = original ? oldProgress >= target || original.get('unlocked_at') : false

    if (isUnlocked && !wasUnlocked && !e.record.get('is_notified')) {
      const achievement = $app.findRecordById('achievements', e.record.get('achievement_id'))
      const notifCol = $app.findCollectionByNameOrId('notifications')
      const notif = new Record(notifCol)
      notif.set('user', e.record.get('user_id'))
      notif.set('title', 'Conquista Desbloqueada!')
      notif.set('message', `Você desbloqueou: ${achievement.get('name')}`)
      notif.set('type', 'achievement')
      notif.set('action_url', `/achievements`)
      notif.set('is_read', false)
      $app.saveNoValidate(notif)

      e.record.set('is_notified', true)
      $app.saveNoValidate(e.record)
    }
  } catch (err) {
    console.error('Error creating achievement notification on update:', err)
  }
  e.next()
}, 'user_achievements')
