migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    // Allow any authenticated user to list and view users so the leaderboard works
    col.listRule = "@request.auth.id != ''"
    col.viewRule = "@request.auth.id != ''"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    // Revert to original restrictive rules
    col.listRule = "@request.auth.role = 'admin' || id = @request.auth.id"
    col.viewRule = "@request.auth.role = 'admin' || id = @request.auth.id"
    app.save(col)
  },
)
