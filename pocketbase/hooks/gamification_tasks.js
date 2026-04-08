onRecordUpdate((e) => {
  const newStatus = e.record.get('status')
  const pointsAwarded = e.record.get('points_awarded')

  if (newStatus === 'done' && !pointsAwarded) {
    e.record.set('points_awarded', true)

    const pointsReward = e.record.get('points_reward') || 0
    const xpReward = pointsReward > 0 ? pointsReward : 10
    const pReward = pointsReward > 0 ? pointsReward : 10

    const targetUserId = e.record.get('delegated_to') || e.record.get('created_by')
    if (!targetUserId) {
      e.next()
      return
    }

    try {
      const user = $app.findRecordById('users', targetUserId)
      const currentPoints = user.get('points') || 0
      const currentXp = user.get('xp') || 0

      const newPoints = currentPoints + pReward
      const newXp = currentXp + xpReward

      user.set('points', newPoints)
      user.set('xp', newXp)
      $app.save(user)

      const historyCol = $app.findCollectionByNameOrId('points_history')
      const historyRecord = new Record(historyCol)
      historyRecord.set('user_id', targetUserId)
      historyRecord.set('points', pReward)
      historyRecord.set('reason', `Tarefa concluída: ${e.record.get('title')}`)
      historyRecord.set('source_type', 'task')
      historyRecord.set('source_id', e.record.get('id'))
      historyRecord.set('balance_after', newPoints)
      $app.save(historyRecord)

      const taskDept = e.record.get('department') || ''
      const userJobTitle = user.get('job_title') || ''
      const nJobTitle = String(userJobTitle).toLowerCase().trim().replace(/ /g, '_')

      const userAchs = $app.findRecordsByFilter(
        'user_achievements',
        `user_id = '${targetUserId}'`,
        '',
        0,
        0,
      )

      for (const ua of userAchs) {
        if (ua.get('unlocked_at')) continue

        try {
          const achId = ua.get('achievement_id')
          const ach = $app.findRecordById('achievements', achId)
          const category = String(ach.get('category')).toLowerCase().trim()

          let shouldIncrement = false
          if (category === 'tasks') shouldIncrement = true
          if (String(taskDept).toLowerCase().trim() === category) shouldIncrement = true
          if (nJobTitle === category || String(userJobTitle).toLowerCase().trim() === category)
            shouldIncrement = true

          if (shouldIncrement) {
            const currentProg = ua.get('progress') || 0
            const targetProg = ua.get('progress_target') || ach.get('requirement_value') || 1
            const newProg = currentProg + 1

            ua.set('progress', newProg)
            if (newProg >= targetProg) {
              ua.set('unlocked_at', new Date().toISOString())
              ua.set('is_notified', false)

              const achPts = ach.get('points_reward') || 0
              const achXp = ach.get('xp_reward') || 0

              if (achPts > 0 || achXp > 0) {
                const u = $app.findRecordById('users', targetUserId)
                const uPts = u.get('points') || 0
                const uXp = u.get('xp') || 0
                const updatedPts = uPts + achPts
                u.set('points', updatedPts)
                u.set('xp', uXp + achXp)
                $app.save(u)

                if (achPts > 0) {
                  const hRecord = new Record(historyCol)
                  hRecord.set('user_id', targetUserId)
                  hRecord.set('points', achPts)
                  hRecord.set('reason', `Conquista desbloqueada: ${ach.get('name')}`)
                  hRecord.set('source_type', 'achievement')
                  hRecord.set('source_id', achId)
                  hRecord.set('balance_after', updatedPts)
                  $app.save(hRecord)
                }
              }

              try {
                const notifCol = $app.findCollectionByNameOrId('notifications')
                const notifRecord = new Record(notifCol)
                notifRecord.set('user', targetUserId)
                notifRecord.set('title', 'Conquista Desbloqueada! 🏆')
                notifRecord.set('message', `Você desbloqueou a conquista: ${ach.get('name')}`)
                notifRecord.set('type', 'achievement')
                notifRecord.set('action_url', '/achievements')
                notifRecord.set('is_read', false)
                $app.save(notifRecord)
              } catch (nErr) {
                console.error('Error sending achievement notification', nErr)
              }
            }
            $app.save(ua)
          }
        } catch (err) {
          console.error('Error processing achievement', err)
        }
      }
    } catch (err) {
      console.error('Error updating user gamification', err)
    }
  }
  e.next()
}, 'tasks')
