migrate(
  (app) => {
    const tasksCol = app.findCollectionByNameOrId('tasks')

    // Admin can see all, employees see only their own or delegated tasks
    tasksCol.listRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || delegated_to = @request.auth.id"
    tasksCol.viewRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || delegated_to = @request.auth.id"

    // Admin can create for anyone, employees can only create for themselves and optionally assign to themselves
    tasksCol.createRule =
      "@request.auth.role = 'admin' || (created_by = @request.auth.id && (delegated_to = '' || delegated_to = @request.auth.id))"

    // Admin can update any, employees can update tasks they created or were delegated to
    tasksCol.updateRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || delegated_to = @request.auth.id"

    // Admin can delete any, employees can only delete tasks they created
    tasksCol.deleteRule = "@request.auth.role = 'admin' || created_by = @request.auth.id"

    app.save(tasksCol)
  },
  (app) => {
    const tasksCol = app.findCollectionByNameOrId('tasks')

    // Revert back to the previous rules defined in 0014_enable_rls_rules.js
    tasksCol.listRule = "@request.auth.id != ''"
    tasksCol.viewRule = "@request.auth.id != ''"
    tasksCol.createRule = "@request.auth.id != ''"
    tasksCol.updateRule = "created_by = @request.auth.id || @request.auth.role = 'admin'"
    tasksCol.deleteRule = "created_by = @request.auth.id || @request.auth.role = 'admin'"

    app.save(tasksCol)
  },
)
