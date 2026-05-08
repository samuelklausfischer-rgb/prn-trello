migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.updateRule =
      '@request.auth.role = \'admin\' || created_by = @request.auth.id || shared_with_users ?= @request.auth.id || (shared_with_roles != null && @request.auth.job_title != "" && shared_with_roles ~ @request.auth.job_title)'
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.updateRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || shared_with_users ?= @request.auth.id || (shared_with_roles != null && @request.auth.job_title != '' && shared_with_roles ~ @request.auth.job_title)"
    app.save(col)
  },
)
