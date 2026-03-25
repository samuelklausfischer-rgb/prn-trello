onRecordUpdate((e) => {
  const newPoints = e.record.get('points') || 0
  const oldRecord = e.record.originalCopy()
  const oldPoints = oldRecord ? oldRecord.get('points') || 0 : 0

  if (newPoints !== oldPoints) {
    e.record.set('last_activity', new Date().toISOString())
  }
  e.next()
}, 'users')

onRecordAfterUpdateSuccess((e) => {
  const newPoints = e.record.get('points') || 0
  const oldRecord = e.record.originalCopy()
  const oldPoints = oldRecord ? oldRecord.get('points') || 0 : 0

  if (newPoints !== oldPoints) {
    const diff = newPoints - oldPoints
    let reason = diff > 0 ? 'Pontos recebidos' : 'Pontos deduzidos'
    let sourceType = 'system'
    let sourceId = ''

    let hasHeaders = false
    try {
      const reqInfo = e.requestInfo()
      if (reqInfo && reqInfo.headers) {
        if (reqInfo.headers['x-point-reason']) {
          hasHeaders = true
          reason = decodeURIComponent(reqInfo.headers['x-point-reason'])
        }
        if (reqInfo.headers['x-source-type']) {
          sourceType = reqInfo.headers['x-source-type']
        }
        if (reqInfo.headers['x-source-id']) {
          sourceId = reqInfo.headers['x-source-id']
        }
      }
    } catch (err) {
      // Ignored: Not running inside an HTTP request context
    }

    // Only log generic points update if explicit headers are passed.
    // Native system hooks (like task completions) handle their own detailed logging
    // to avoid duplicate records in points_history.
    if (!hasHeaders) {
      e.next()
      return
    }

    try {
      const historyCol = $app.findCollectionByNameOrId('points_history')
      const history = new Record(historyCol)
      history.set('user_id', e.record.id)
      history.set('points', diff)
      history.set('reason', reason)
      history.set('source_type', sourceType)
      history.set('source_id', sourceId)
      history.set('balance_after', newPoints)

      $app.saveNoValidate(history)
    } catch (dbErr) {
      console.error('Failed to log points history: ' + dbErr)
    }
  }
  e.next()
}, 'users')
