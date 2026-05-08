onRecordUpdateRequest((e) => {
  try {
    const authRecord = e.auth
    if (!authRecord) {
      throw new UnauthorizedError('Não autorizado')
    }

    const role = authRecord.get('role') || ''

    // Backend Hook Optimization: safely check for existence
    const reqInfo = e.requestInfo() || {}
    const body = reqInfo.body || {}
    const headers = reqInfo.headers || {}

    const clientUpdated = headers['x_optimistic_updated'] || headers['x-optimistic-updated']

    if (clientUpdated) {
      const dbUpdated = e.record.get('updated')
      if (String(dbUpdated).trim() !== String(clientUpdated).trim()) {
        throw new BadRequestError(
          'A tarefa foi modificada por outro usuário desde que você a abriu. Atualize a página e tente novamente.',
        )
      }
    }

    if (String(role).toLowerCase() !== 'admin') {
      const restrictedFields = [
        'title',
        'due_date',
        'deadline_type',
        'delegated_to',
        'priority',
        'points_reward',
        'points_awarded',
        'is_archived',
        'is_private',
      ]

      for (const field of restrictedFields) {
        if (field in body) {
          const original = e.record.original()
          const oldVal = original ? original.get(field) : e.record.get(field)
          const newVal = body[field]

          if (String(oldVal || '') !== String(newVal || '')) {
            throw new ForbiddenError(
              `Permissão negada. Apenas administradores podem alterar: ${field}`,
            )
          }
        }
      }
    }
  } catch (err) {
    if (err.status) throw err
    $app.logger().error('Error in on_task_update_request hook', 'error', String(err))
    throw new BadRequestError('Erro interno ao validar atualização da tarefa.')
  }

  return e.next()
}, 'tasks')
