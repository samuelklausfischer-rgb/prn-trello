onRecordUpdateRequest((e) => {
  const authRecord = e.auth
  if (!authRecord) throw new UnauthorizedError('Não autorizado')

  const role = authRecord.get('role') || ''
  if (String(role).toLowerCase() !== 'admin') {
    const body = e.requestInfo().body
    const restrictedFields = ['points', 'xp', 'level']

    for (const field of restrictedFields) {
      if (field in body) {
        const oldVal = e.record.get(field)
        const newVal = body[field]

        if (String(oldVal || '') !== String(newVal || '')) {
          throw new ForbiddenError(
            `Permissão negada. Apenas administradores podem alterar pontuação diretamente: ${field}`,
          )
        }
      }
    }
  }
  e.next()
}, 'users')
