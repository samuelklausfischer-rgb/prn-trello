migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.listRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || shared_with_users ?= @request.auth.id || (@request.auth.job_title != '' && shared_with_roles ?= @request.auth.job_title)"
    col.viewRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || shared_with_users ?= @request.auth.id || (@request.auth.job_title != '' && shared_with_roles ?= @request.auth.job_title)"
    col.updateRule = "@request.auth.role = 'admin' || created_by = @request.auth.id"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.listRule = "@request.auth.id != ''"
    col.viewRule = "@request.auth.id != ''"
    col.updateRule = "@request.auth.id != ''"
    app.save(col)
  },
)
