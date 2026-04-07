onRecordAfterUpdateSuccess((e) => {
  try {
    const original = e.record.originalCopy()
    if (!original) {
      return e.next()
    }

    let userId = e.record.get('created_by')
    try {
      const reqInfo = e.requestInfo()
      if (reqInfo && reqInfo.auth && reqInfo.auth.id) {
        userId = reqInfo.auth.id
      }
    } catch (err) {
      // Ignored: Background process or non-HTTP context
    }

    const fieldsToWatch = [
      'title',
      'description',
      'status',
      'priority',
      'due_date',
      'deadline_type',
      'delegated_to',
    ]

    try {
      const historyCol = $app.findCollectionByNameOrId('task_history')

      fieldsToWatch.forEach((field) => {
        const oldVal = original.get(field)
        const newVal = e.record.get(field)

        if (String(oldVal || '') !== String(newVal || '')) {
          let action = `${field}_update`.toUpperCase()
          if (field === 'status') action = 'UPDATE_STATUS'
          if (field === 'due_date') action = 'CHANGE_DEADLINE'
          if (field === 'delegated_to') action = 'REASSIGN'

          let oldStr = String(oldVal || '')
          let newStr = String(newVal || '')

          if (field === 'status') {
            const statuses = {
              todo: 'A Fazer',
              in_progress: 'Em Progresso',
              review: 'Em Revisão',
              done: 'Concluído',
            }
            oldStr = statuses[oldStr] || oldStr
            newStr = statuses[newStr] || newStr
          }

          if (field === 'priority') {
            const priorities = { low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente' }
            oldStr = priorities[oldStr] || oldStr
            newStr = priorities[newStr] || newStr
          }

          try {
            const record = new Record(historyCol)
            record.set('task_id', e.record.id)
            record.set('action', action)
            record.set('description', `Alterou o campo ${field}`)
            record.set('old_value', oldStr)
            record.set('new_value', newStr)
            record.set('performed_by', userId)

            $app.saveNoValidate(record)
          } catch (err) {
            console.error('Failed to log task history: ' + err)
          }
        }
      })
    } catch (err) {
      console.error('Failed to get task_history collection: ' + err)
    }
  } catch (err) {
    console.error('Error in audit_tasks hook: ', err)
  }

  return e.next()
}, 'tasks')
