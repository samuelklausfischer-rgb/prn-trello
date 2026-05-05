migrate(
  (app) => {
    let fallbackId = ''
    try {
      const admin = app.findFirstRecordByFilter('users', "role = 'admin'")
      fallbackId = admin.id
    } catch (_) {
      try {
        const anyUser = app.findFirstRecordByFilter('users', '1=1')
        fallbackId = anyUser.id
      } catch (_) {}
    }

    if (fallbackId) {
      app
        .db()
        .newQuery(
          "UPDATE projects SET created_by = {:userId} WHERE created_by = '' OR created_by IS NULL",
        )
        .bind({ userId: fallbackId })
        .execute()
    }

    const col = app.findCollectionByNameOrId('projects')
    col.updateRule = "@request.auth.role = 'admin' || created_by = @request.auth.id"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.updateRule = "@request.auth.id != ''"
    app.save(col)
  },
)
