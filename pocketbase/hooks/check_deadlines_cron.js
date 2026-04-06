cronAdd('process_deadlines_24h', '0 * * * *', () => {
  const nowStr = new Date().toISOString()
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const tomorrowStr = tomorrow.toISOString()

  try {
    const tasks = $app.findRecordsByFilter(
      'tasks',
      "due_date != '' && due_date <= {:tomorrow} && due_date >= {:now} && status != 'done' && deadline_warned = false",
      '',
      500,
      0,
      { tomorrow: tomorrowStr, now: nowStr },
    )

    tasks.forEach((task) => {
      const targetUser = task.get('delegated_to') || task.get('created_by')

      if (targetUser) {
        const notifCol = $app.findCollectionByNameOrId('notifications')
        const notif = new Record(notifCol)
        notif.set('user', targetUser)
        notif.set('title', 'Prazo Próximo (24h)')
        notif.set('message', `A tarefa "${task.get('title')}" vence em menos de 24 horas!`)
        notif.set('type', 'task_deadline')
        notif.set('action_url', `/tasks`)
        notif.set('is_read', false)
        $app.saveNoValidate(notif)
      }

      task.set('deadline_warned', true)
      $app.saveNoValidate(task)
    })
  } catch (err) {
    console.error('Error processing deadlines cron:', err)
  }
})
