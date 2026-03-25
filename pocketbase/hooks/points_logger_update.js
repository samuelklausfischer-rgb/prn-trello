onRecordUpdate((e) => {
  const newPoints = e.record.get('points') || 0
  const oldRecord = e.record.originalCopy()
  const oldPoints = oldRecord ? oldRecord.get('points') || 0 : 0

  if (newPoints !== oldPoints) {
    e.record.set('last_activity', new Date().toISOString())
  }
  e.next()
}, 'users')
