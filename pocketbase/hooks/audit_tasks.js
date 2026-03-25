onRecordAfterUpdateSuccess((e) => {
  try {
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
      // Ignored: Background process or non-HTTP context
    }

    if (!userId) {
      userId = e.record.get('created_by')
    }

    const fieldsToWatch = ['priority', 'title', 'delegated_to', 'due_date']
    const historyCol = $app.findCollectionByNameOrId('task_history')

    fieldsToWatch.forEach((field) => {
      const oldVal = original.get(field)
      const newVal = e.record.get(field)

      if (String(oldVal || '') !== String(newVal || '')) {
        try {
          const record = new Record(historyCol)
          record.set('task_id', e.record.id)
          record.set('action', `${field}_update`.toUpperCase())
          record.set('description', `Campo ${field} atualizado`)
          record.set('old_value', String(oldVal || ''))
          record.set('new_value', String(newVal || ''))
          record.set('performed_by', userId)

          $app.saveNoValidate(record)
        } catch (err) {
          console.error('Failed to log task history: ' + err)
        }
      }
    })
  } catch (err) {
    console.error('Error in audit_tasks hook: ', err)
  }

  e.next()
}, 'tasks')
