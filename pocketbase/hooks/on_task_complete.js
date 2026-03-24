onRecordUpdateRequest((e) => {
  e.set('oldStatus', e.record.get('status'))
  e.next()
}, 'tasks')

onRecordAfterUpdateRequest((e) => {
  const oldStatus = e.get('oldStatus')
  const newStatus = e.record.get('status')

  if (newStatus === 'done' && oldStatus !== 'done') {
    const userId = e.record.get('delegated_to') || e.record.get('created_by')
    if (!userId) {
      e.next()
      return
    }

    try {
      const achievements = $app.findRecordsByFilter(
        'achievements',
        "category = 'tasks' && is_active = true",
        '',
        100,
        0,
      )
      const collection = $app.findCollectionByNameOrId('user_achievements')

      achievements.forEach((ach) => {
        let ua
        try {
          ua = $app.findFirstRecordByFilter(
            'user_achievements',
            'user_id = {:user} && achievement_id = {:ach}',
            { user: userId, ach: ach.id },
          )
        } catch (_) {
          ua = new Record(collection)
          ua.set('user_id', userId)
          ua.set('achievement_id', ach.id)
          ua.set('progress', 0)
          ua.set('progress_target', ach.get('requirement_value'))
          ua.set('is_notified', false)
        }

        if (!ua.get('unlocked_at')) {
          let prog = ua.get('progress') + 1
          ua.set('progress', prog)

          if (prog >= ua.get('progress_target')) {
            ua.set('unlocked_at', new Date().toISOString())
            ua.set('is_notified', false)

            try {
              const userRecord = $app.findRecordById('users', userId)
              userRecord.set('points', userRecord.get('points') + ach.get('points_reward'))
              userRecord.set('xp', userRecord.get('xp') + ach.get('xp_reward'))
              $app.saveNoValidate(userRecord)
            } catch (err) {
              console.log('Error updating user points: ' + err.message)
            }
          }
          $app.save(ua)
        }
      })
    } catch (err) {
      console.log('Error processing achievements: ' + err.message)
    }
  }
  e.next()
}, 'tasks')
