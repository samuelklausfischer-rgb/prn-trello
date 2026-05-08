migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('projects')

    // Refine the rule to fix security flaws and properly support empty fields
    collection.updateRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || shared_with_users ?= @request.auth.id || (@request.auth.job_title != '' && shared_with_roles ?= @request.auth.job_title)"

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('projects')

    // Revert back to the old potentially flawed rule
    collection.updateRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || shared_with_users ?= @request.auth.id || (shared_with_roles = null || (@request.auth.job_title != '' && shared_with_roles ~ @request.auth.job_title))"

    app.save(collection)
  },
)
