migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('tasks')

    // Add is_private boolean field
    col.fields.add(new BoolField({ name: 'is_private' }))

    // Update list and view rules to strictly enforce privacy
    // Admins can see all
    // Employees can only see tasks that are NOT private AND (created by them OR delegated to them)
    // Plus, the owner of a private task can see it
    const newRule =
      "@request.auth.role = 'admin' || (is_private = false && (created_by = @request.auth.id || delegated_to = @request.auth.id)) || (is_private = true && created_by = @request.auth.id)"

    col.listRule = newRule
    col.viewRule = newRule

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('tasks')

    col.fields.removeByName('is_private')

    // Restore previous rules
    col.listRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || delegated_to = @request.auth.id"
    col.viewRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || delegated_to = @request.auth.id"

    app.save(col)
  },
)
