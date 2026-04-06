cronAdd('check_bottlenecks_daily', '0 9 * * *', () => {
  const nowStr = new Date().toISOString()

  try {
    const overdueTasks = $app.findRecordsByFilter(
      'tasks',
      "due_date != '' && due_date < {:now} && status != 'done' && (priority = 'high' || priority = 'urgent')",
      '',
      100,
      0,
      { now: nowStr },
    )

    if (overdueTasks.length > 5) {
      const admin = $app.findFirstRecordByFilter('users', "role = 'admin'")
      if (admin) {
        const alertsCol = $app.findCollectionByNameOrId('alerts')
        const alert = new Record(alertsCol)
        alert.set('title', 'Gargalo Detectado: Tarefas Críticas Atrasadas')
        alert.set(
          'message',
          `Existem ${overdueTasks.length} tarefas de alta prioridade ou urgentes atrasadas no momento. Verifique o quadro de tarefas.`,
        )
        alert.set('type', 'bottleneck')
        alert.set('target_role', 'admin')
        alert.set('is_sent', false)
        alert.set('created_by', admin.id)
        $app.saveNoValidate(alert)
      }
    }
  } catch (err) {
    console.error('Error processing bottlenecks cron:', err)
  }
})
