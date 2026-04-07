onRecordValidate((e) => {
  if (e.record && e.record.isNew() && !e.record.get('sender')) {
    const alertId = e.record.get('alert')
    if (alertId) {
      try {
        const alert = $app.findRecordById('alerts', alertId)
        const createdBy = alert.get('created_by')
        if (createdBy) {
          e.record.set('sender', createdBy)
        }
      } catch (err) {}
    }
  }
  e.next()
}, 'notifications')
