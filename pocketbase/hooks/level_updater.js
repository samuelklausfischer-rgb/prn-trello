onRecordUpdate((e) => {
  const newXp = e.record.get('xp') || 0
  const oldRecord = e.record.originalCopy()
  const oldXp = oldRecord ? oldRecord.get('xp') || 0 : 0

  if (newXp !== oldXp) {
    try {
      const levels = $app.findRecordsByFilter('levels', `min_xp <= ${newXp}`, '-min_xp', 1, 0)

      if (levels && levels.length > 0) {
        const newLevel = levels[0].get('level_number')
        const currentLevel = e.record.get('level') || 0
        if (newLevel !== currentLevel) {
          e.record.set('level', newLevel)
        }
      }
    } catch (err) {
      console.error('Failed to evaluate user level: ' + err)
    }
  }
  e.next()
}, 'users')
