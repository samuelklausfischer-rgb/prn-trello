onRecordUpdate((e) => {
  const newStatus = e.record.getString('status')
  const original = e.record.original()
  const oldStatus = original ? original.getString('status') : ''

  if (newStatus === 'completed' && oldStatus !== 'completed') {
    const targetUserId = e.record.getString('created_by')
    if (!targetUserId) {
      e.next()
      return
    }

    try {
      const pReward = 100
      const xpReward = 500

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
      historyRecord.set('reason', `Projeto concluído: ${e.record.getString('name')}`)
      historyRecord.set('source_type', 'project')
      historyRecord.set('source_id', e.record.id)
      historyRecord.set('balance_after', newPoints)
      $app.save(historyRecord)

      const userJobTitle = user.getString('job_title') || ''
      const nJobTitle = String(userJobTitle).toLowerCase().trim().replace(/ /g, '_')
      const userAchs = $app.findRecordsByFilter(
        'user_achievements',
        `user_id = '${targetUserId}'`,
        '',
        0,
        0,
      )

      for (const ua of userAchs) {
        if (ua.getString('unlocked_at')) continue

        try {
          const achId = ua.getString('achievement_id')
          const ach = $app.findRecordById('achievements', achId)
          const category = String(ach.getString('category')).toLowerCase().trim()

          let shouldIncrement = false
          if (category === 'milestone') shouldIncrement = true
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
                  hRecord.set('reason', `Conquista desbloqueada: ${ach.getString('name')}`)
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
                notifRecord.set('message', `Você desbloqueou a conquista: ${ach.getString('name')}`)
                notifRecord.set('type', 'achievement')
                notifRecord.set('action_url', '/achievements')
                notifRecord.set('is_read', false)
                $app.save(notifRecord)
              } catch (nErr) {
                $app.logger().error('Error sending achievement notification', 'error', String(nErr))
              }
            }
            $app.save(ua)
          }
        } catch (err) {
          $app.logger().error('Error processing achievement in project', 'error', String(err))
        }
      }
    } catch (err) {
      $app.logger().error('Error updating gamification for project', 'error', String(err))
    }
  }
  e.next()
}, 'projects')
