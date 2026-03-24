migrate(
  (app) => {
    // 1. Update checklists collection rules
    const checklistsCol = app.findCollectionByNameOrId('checklists')
    const checklistRule =
      "@request.auth.role = 'admin' || task_id.created_by = @request.auth.id || task_id.delegated_to = @request.auth.id"

    checklistsCol.listRule = checklistRule
    checklistsCol.viewRule = checklistRule
    checklistsCol.createRule = checklistRule
    checklistsCol.updateRule = checklistRule
    checklistsCol.deleteRule = checklistRule

    app.save(checklistsCol)

    // 2. Update task_history collection rules
    const historyCol = app.findCollectionByNameOrId('task_history')
    const historyReadRule =
      "@request.auth.role = 'admin' || task_id.created_by = @request.auth.id || task_id.delegated_to = @request.auth.id"

    historyCol.listRule = historyReadRule
    historyCol.viewRule = historyReadRule
    historyCol.createRule = "@request.auth.id != ''"
    historyCol.updateRule = null
    historyCol.deleteRule = null

    app.save(historyCol)
  },
  (app) => {
    // Revert checklists collection rules
    const checklistsCol = app.findCollectionByNameOrId('checklists')
    checklistsCol.listRule = "@request.auth.id != ''"
    checklistsCol.viewRule = "@request.auth.id != ''"
    const chkWriteRule =
      "task_id.created_by = @request.auth.id || task_id.delegated_to = @request.auth.id || @request.auth.role = 'admin'"
    checklistsCol.createRule = chkWriteRule
    checklistsCol.updateRule = chkWriteRule
    checklistsCol.deleteRule = chkWriteRule

    app.save(checklistsCol)

    // Revert task_history collection rules
    const historyCol = app.findCollectionByNameOrId('task_history')
    historyCol.listRule = "@request.auth.id != ''"
    historyCol.viewRule = "@request.auth.id != ''"
    historyCol.createRule = "@request.auth.role = 'admin'"
    historyCol.updateRule = "@request.auth.role = 'admin'"
    historyCol.deleteRule = "@request.auth.role = 'admin'"

    app.save(historyCol)
  },
)
