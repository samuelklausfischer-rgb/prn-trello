migrate(
  (app) => {
    // 1. Add deadline_warned field to tasks
    const tasks = app.findCollectionByNameOrId('tasks')
    if (!tasks.fields.getByName('deadline_warned')) {
      tasks.fields.add(new BoolField({ name: 'deadline_warned' }))
      app.save(tasks)
    }

    // 2. Update alerts type select values
    const alerts = app.findCollectionByNameOrId('alerts')
    const alertType = alerts.fields.getByName('type')
    if (alertType) {
      alertType.values = [
        'task_deadline',
        'performance',
        'achievement',
        'system',
        'custom',
        'delegation',
        'bottleneck',
        'level_up',
      ]
      app.save(alerts)
    }

    // 3. Update notifications type select values
    const notifs = app.findCollectionByNameOrId('notifications')
    const notifType = notifs.fields.getByName('type')
    if (notifType) {
      notifType.values = [
        'task_deadline',
        'performance',
        'achievement',
        'system',
        'custom',
        'delegation',
        'bottleneck',
        'level_up',
      ]
      app.save(notifs)
    }
  },
  (app) => {
    // Revert values (removing specific values is non-trivial if data exists, keeping safe)
    try {
      const alerts = app.findCollectionByNameOrId('alerts')
      const alertType = alerts.fields.getByName('type')
      if (alertType) {
        alertType.values = [
          'task_deadline',
          'performance',
          'achievement',
          'system',
          'custom',
          'delegation',
        ]
        app.save(alerts)
      }

      const notifs = app.findCollectionByNameOrId('notifications')
      const notifType = notifs.fields.getByName('type')
      if (notifType) {
        notifType.values = [
          'task_deadline',
          'performance',
          'achievement',
          'system',
          'custom',
          'delegation',
        ]
        app.save(notifs)
      }
    } catch (_) {}
  },
)
