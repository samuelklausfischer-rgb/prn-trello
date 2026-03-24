onRecordAfterUpdateSuccess((e) => {
  const original = e.record.originalCopy()
  if (!original) {
    e.next()
    return
  }

  let userId = ''
  try {
    const reqInfo = e.requestInfo()
    if (reqInfo && reqInfo.auth) {
      userId = reqInfo.auth.id
    }
  } catch (err) {
    // Ignored: Not running inside an HTTP request context
  }

  if (!userId) {
    userId = e.record.get('created_by')
  }

  const fieldsToWatch = ['status', 'priority', 'title', 'delegated_to', 'due_date']
  const historyCol = $app.findCollectionByNameOrId('task_history')

  fieldsToWatch.forEach((field) => {
    const oldVal = original.get(field)
    const newVal = e.record.get(field)

    if (String(oldVal || '') !== String(newVal || '')) {
      const record = new Record(historyCol)
      record.set('task_id', e.record.id)
      record.set('action', `${field}_update`)
      record.set('description', `Task ${field} updated`)
      record.set('old_value', String(oldVal || ''))
      record.set('new_value', String(newVal || ''))
      record.set('performed_by', userId)

      try {
        $app.saveNoValidate(record)
      } catch (err) {
        console.error('Failed to log task history: ' + err)
      }
    }
  })

  e.next()
}, 'tasks')
