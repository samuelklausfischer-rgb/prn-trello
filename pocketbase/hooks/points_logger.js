onRecordUpdate((e) => {
  const newPoints = e.record.get('points') || 0
  const oldRecord = e.record.originalCopy()
  const oldPoints = oldRecord ? oldRecord.get('points') || 0 : 0

  if (newPoints !== oldPoints) {
    const diff = newPoints - oldPoints
    let reason = diff > 0 ? 'Pontos recebidos' : 'Pontos deduzidos'
    let sourceType = 'system'
    let sourceId = ''

    try {
      const reqInfo = e.requestInfo()
      if (reqInfo && reqInfo.headers) {
        const hReason = reqInfo.headers['x-point-reason']
        if (hReason) {
          try {
            reason = decodeURIComponent(hReason)
          } catch (_) {
            reason = hReason
          }
        }

        const hType = reqInfo.headers['x-source-type']
        if (hType) sourceType = hType

        const hId = reqInfo.headers['x-source-id']
        if (hId) sourceId = hId
      }
    } catch (err) {
      // Ignore if not executing inside an HTTP request context
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

      $app.save(history)
    } catch (dbErr) {
      console.error('Failed to log points history: ' + dbErr)
    }
  }
  e.next()
}, 'users')
