onRecordUpdateRequest((e) => {
  const authRecord = e.auth
  if (!authRecord) {
    throw new UnauthorizedError('Não autorizado')
  }

  const role = authRecord.get('role') || ''
  const body = e.requestInfo().body

  const headers = e.requestInfo().headers
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
        const oldVal = e.record.get(field)
        const newVal = body[field]

        if (String(oldVal || '') !== String(newVal || '')) {
          throw new ForbiddenError(
            `Permissão negada. Apenas administradores podem alterar: ${field}`,
          )
        }
      }
    }
  }

  e.next()
}, 'tasks')
