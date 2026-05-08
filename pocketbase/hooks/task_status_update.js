onRecordUpdate((e) => {
  try {
    const original = e.record.original()
    if (!original) {
      return e.next()
    }

    const newStatus = e.record.getString('status')
    const oldStatus = original.getString('status')

    if (newStatus !== oldStatus) {
      if (newStatus === 'in_progress' && !e.record.getString('started_at')) {
        e.record.set('started_at', new Date().toISOString())
      }

      if (newStatus === 'done') {
        e.record.set('completed_at', new Date().toISOString())
      } else if (newStatus !== 'done' && e.record.getString('completed_at')) {
        e.record.set('completed_at', '')
      }
    }
  } catch (err) {
    $app.logger().error('Error in task_status_update hook', 'error', String(err))
  }

  return e.next()
}, 'tasks')
