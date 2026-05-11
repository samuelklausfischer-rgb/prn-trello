onRecordUpdateRequest((e) => {
  const original = e.record.original()

  if (e.hasSuperuserAuth()) return e.next()

  const auth = e.auth
  if (!auth) return e.next()

  const authId = auth.id
  const role = auth.getString('role')
  const isAdmin = role === 'admin' || role === 'ADMIN'
  if (isAdmin) return e.next()

  const isCreator = original.getString('created_by') === authId
  const wasSharedWithUser = original.getStringSlice('shared_with_users').includes(authId)
  const userJobTitle = auth.getString('job_title')
  const wasSharedWithRole =
    userJobTitle && original.getStringSlice('shared_with_roles').includes(userJobTitle)

  const canEdit = isCreator || wasSharedWithUser || wasSharedWithRole

  if (!canEdit) {
    const wasAvailable = original.getBool('is_available')

    if (wasAvailable) {
      const body = e.requestInfo().body
      const allowedFields = ['is_available', 'shared_with_users']

      for (const key of Object.keys(body)) {
        if (!allowedFields.includes(key)) {
          throw new ForbiddenError(
            `You can only claim the project, not modify other fields (${key}).`,
          )
        }
      }
    } else {
      throw new ForbiddenError(`You do not have permission to update this project.`)
    }
  }

  e.next()
}, 'projects')
