onRecordAfterUpdateSuccess((e) => {
  try {
    const original = e.record.original()
    if (!original) {
      return e.next()
    }

    const newStatus = e.record.getString('status')
    const oldStatus = original.getString('status')

    if (newStatus !== oldStatus) {
      const task = e.record

      let performedBy = task.getString('created_by')
      try {
        const reqInfo = e.requestInfo()
        if (reqInfo && reqInfo.auth && reqInfo.auth.id) {
          performedBy = reqInfo.auth.id
        }
      } catch (err) {
        // Ignored: Background process or non-HTTP context
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
        history.set('performed_by', performedBy || task.getString('created_by'))

        $app.saveNoValidate(history)
      } catch (err) {
        console.error('Error saving task history: ' + err)
      }

      // 2. Gamification Rewards and Task Completion Logic
      if (newStatus === 'done' && !task.getBool('points_awarded')) {
        try {
          const targetUserId = task.getString('delegated_to') || task.getString('created_by')
          const pointsReward = task.getInt('points_reward') || 0

          if (targetUserId) {
            const user = $app.findRecordById('users', targetUserId)
            if (user) {
              const currentPoints = user.getInt('points') || 0
              const currentXp = user.getInt('xp') || 0

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
                  ph.set('reason', `Tarefa concluída: ${task.getString('title')}`)
                  ph.set('source_type', 'task')
                  ph.set('source_id', task.id)
                  ph.set('balance_after', newPoints)

                  $app.saveNoValidate(ph)
                } catch (phErr) {
                  console.error('Error saving points history: ' + phErr)
                }
              }

              // Update task using raw query to prevent recursive hook triggers
              try {
                $app
                  .db()
                  .newQuery('UPDATE tasks SET points_awarded = {:val} WHERE id = {:id}')
                  .bind({ val: true, id: task.id })
                  .execute()
              } catch (taskErr) {
                console.error('Error updating task points_awarded: ' + taskErr)
              }
            }
          }
        } catch (err) {
          console.error('Error updating gamification rewards: ' + err)
        }
      }
    }
  } catch (err) {
    console.error('Fatal error in task_status_success hook: ', err)
  }

  return e.next()
}, 'tasks')
