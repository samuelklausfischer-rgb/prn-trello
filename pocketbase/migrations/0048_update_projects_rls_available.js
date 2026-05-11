migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('projects')

    const newRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || shared_with_users ?= @request.auth.id || (@request.auth.job_title != '' && shared_with_roles ?= @request.auth.job_title) || is_available = true"

    col.listRule = newRule
    col.viewRule = newRule
    col.updateRule = newRule

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('projects')

    const oldRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || shared_with_users ?= @request.auth.id || (@request.auth.job_title != '' && shared_with_roles ?= @request.auth.job_title)"

    col.listRule = oldRule
    col.viewRule = oldRule
    col.updateRule = oldRule

    app.save(col)
  },
)
