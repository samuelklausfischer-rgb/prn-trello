onRecordUpdate((e) => {
  const original = e.record.originalCopy()
  if (!original) {
    e.next()
    return
  }

  const newStatus = e.record.get('status')
  const oldStatus = original.get('status')

  if (newStatus !== oldStatus) {
    if (newStatus === 'in_progress' && !e.record.get('started_at')) {
      e.record.set('started_at', new Date().toISOString())
    }

    if (newStatus === 'done') {
      e.record.set('completed_at', new Date().toISOString())
    } else if (newStatus !== 'done' && e.record.get('completed_at')) {
      e.record.set('completed_at', '')
    }
  }

  e.next()
}, 'tasks')

onRecordAfterUpdateSuccess((e) => {
  const original = e.record.originalCopy()
  if (!original) {
    e.next()
    return
  }

  const newStatus = e.record.get('status')
  const oldStatus = original.get('status')

  if (newStatus !== oldStatus) {
    const task = e.record

    let performedBy = ''
    try {
      const reqInfo = e.requestInfo()
      if (reqInfo && reqInfo.auth) {
        performedBy = reqInfo.auth.id
      }
    } catch (err) {
      // Ignored: Background process or non-HTTP context
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
      history.set('description', `Status alterado de ${oldStatus || 'Nenhum'} para ${newStatus}`)
      history.set('old_value', String(oldStatus || ''))
      history.set('new_value', String(newStatus || ''))
      history.set('performed_by', performedBy)

      $app.saveNoValidate(history)
    } catch (err) {
      console.error('Error saving task history: ' + err)
    }

    // 2. Gamification Rewards and Task Completion Logic
    if (newStatus === 'done' && !task.get('points_awarded')) {
      try {
        const targetUserId = task.get('delegated_to') || task.get('created_by')
        const pointsReward = task.get('points_reward') || 0

        if (targetUserId) {
          const user = $app.findRecordById('users', targetUserId)
          const currentPoints = user.get('points') || 0
          const currentXp = user.get('xp') || 0

          const newPoints = currentPoints + pointsReward
          const newXp = currentXp + pointsReward

          user.set('points', newPoints)
          user.set('xp', newXp)
          user.set('last_activity', new Date().toISOString())

          $app.saveNoValidate(user)

          // 3. Points History Integration
          if (pointsReward > 0) {
            try {
              const phCol = $app.findCollectionByNameOrId('points_history')
              const ph = new Record(phCol)
              ph.set('user_id', targetUserId)
              ph.set('points', pointsReward)
              ph.set('reason', `Tarefa concluída: ${task.get('title')}`)
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
          try {
            $app.saveNoValidate(task)
          } catch (taskErr) {
            console.error('Error updating task points_awarded: ' + taskErr)
          }
        }
      } catch (err) {
        console.error('Error updating gamification rewards: ' + err)
      }
    }
  }

  e.next()
}, 'tasks')
