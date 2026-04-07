onRecordUpdate((e) => {
  try {
    const original = e.record.originalCopy()
    if (!original) {
      return e.next()
    }

    const newStatus = e.record.get('status')
    const oldStatus = original.get('status')

    if (newStatus !== oldStatus) {
      if (newStatus === 'in_progress' && !e.record.get('started_at')) {
        e.record.set('started_at', new Date().toISOString())
      }

      if (newStatus === 'done') {
        e.record.set('completed_at', new Date().toISOString())
      } else if (newStatus !== 'done' && e.record.get('completed_at')) {
        e.record.set('completed_at', '')
      }
    }
  } catch (err) {
    console.error('Error in task_status_update hook: ', err)
  }

  return e.next()
}, 'tasks')
