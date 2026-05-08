migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('projects')

    // Ensure shared_with_users is fully configured as multi-select relation
    const relField = col.fields.getByName('shared_with_users')
    if (relField) {
      relField.maxSelect = 2000000
    }

    // Update rule to safely handle empty JSON arrays for roles
    col.updateRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || shared_with_users ?= @request.auth.id || (shared_with_roles != null && @request.auth.job_title != '' && shared_with_roles ~ @request.auth.job_title)"

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.updateRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || shared_with_users ?= @request.auth.id || (@request.auth.job_title != '' && shared_with_roles ?= @request.auth.job_title)"
    app.save(col)
  },
)
