migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.updateRule = "@request.auth.id != ''"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.updateRule =
      "@request.auth.role = 'admin' || @request.auth.role = 'ADMIN' || @request.auth.role = 'administrator' || created_by = @request.auth.id"
    app.save(col)
  },
)
