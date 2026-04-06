onRecordAfterUpdateSuccess((e) => {
  const newAssignee = e.record.get('delegated_to')
  const original = e.record.originalCopy()
  const oldAssignee = original ? original.get('delegated_to') : ''

  if (newAssignee && newAssignee !== oldAssignee) {
    try {
      const notifCol = $app.findCollectionByNameOrId('notifications')
      const notif = new Record(notifCol)
      notif.set('user', newAssignee)
      notif.set('title', 'Nova Tarefa Delegada')
      notif.set('message', `Você foi designado para a tarefa: ${e.record.get('title')}`)
      notif.set('type', 'delegation')
      notif.set('action_url', `/tasks`)
      notif.set('is_read', false)
      $app.saveNoValidate(notif)
    } catch (err) {
      console.error('Error creating delegation notification:', err)
    }
  }
  e.next()
}, 'tasks')
