onRecordUpdateRequest((e) => {
  const original = e.record.originalCopy()
  if (!original) {
    e.next()
    return
  }

  const newStatus = e.record.get('status')
  const oldStatus = original.get('status')

  if (newStatus !== oldStatus) {
    e.set('status_changed', true)
    e.set('old_status', oldStatus)
    e.set('new_status', newStatus)

    if (newStatus === 'done') {
      e.record.set('completed_at', new Date().toISOString())
    }
  }

  e.next()
}, 'tasks')

onRecordAfterUpdateSuccess((e) => {
  if (!e.get('status_changed')) {
    e.next()
    return
  }

  const oldStatus = e.get('old_status')
  const newStatus = e.get('new_status')
  const task = e.record

  let performedBy = ''
  try {
    const reqInfo = e.requestInfo()
    if (reqInfo && reqInfo.auth) {
      performedBy = reqInfo.auth.id
    }
  } catch (err) {
    // Ignored: Not running inside an HTTP request context
  }

  if (!performedBy) {
    performedBy = task.get('created_by')
  }

  // 1. History Logging
  try {
    const historyCol = $app.findCollectionByNameOrId('task_history')
    const history = new Record(historyCol)
    history.set('task_id', task.id)
    history.set('action', 'STATUS_CHANGED')
    history.set('description', `Status alterado de ${oldStatus} para ${newStatus}`)
    history.set('old_value', oldStatus)
    history.set('new_value', newStatus)
    history.set('performed_by', performedBy)

    $app.saveNoValidate(history)
  } catch (err) {
    console.error('Error saving task history: ' + err)
  }

  // 2. Gamification Rewards and Task Completion Logic
  if (newStatus === 'done' && !task.get('points_awarded')) {
    const targetUserId = task.get('delegated_to') || task.get('created_by')
    const pointsReward = task.get('points_reward') || 0

    if (targetUserId) {
      try {
        const user = $app.findRecordById('users', targetUserId)
        const currentPoints = user.get('points') || 0
        const currentXp = user.get('xp') || 0

        const newPoints = currentPoints + pointsReward
        const newXp = currentXp + pointsReward

        user.set('points', newPoints)
        user.set('xp', newXp)
        user.set('last_activity', new Date().toISOString())

        // 3. Level Recalculation
        try {
          const levels = $app.findRecordsByFilter(
            'levels',
            'min_xp <= {:points}',
            '-level_number',
            1,
            0,
            { points: newPoints },
          )

          if (levels && levels.length > 0) {
            const newLevel = levels[0].get('level_number')
            if (newLevel !== user.get('level')) {
              user.set('level', newLevel)
            }
          }
        } catch (lvlErr) {
          console.error('Error recalculating level: ' + lvlErr)
        }

        $app.saveNoValidate(user)

        // 4. Points History Integration
        if (pointsReward > 0) {
          try {
            const phCol = $app.findCollectionByNameOrId('points_history')
            const ph = new Record(phCol)
            ph.set('user_id', targetUserId)
            ph.set('points', pointsReward)
            ph.set('reason', `Tarefa concluida: ${task.get('title')}`)
            ph.set('source_type', 'task')
            ph.set('source_id', task.id)
            ph.set('balance_after', newPoints)

            $app.saveNoValidate(ph)
          } catch (phErr) {
            console.error('Error saving points history: ' + phErr)
          }
        }

        // Mark task as points awarded to prevent double rewards
        task.set('points_awarded', true)
        $app.saveNoValidate(task)
      } catch (err) {
        console.error('Error updating gamification rewards: ' + err)
      }
    }
  }

  e.next()
}, 'tasks')
