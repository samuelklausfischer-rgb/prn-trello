migrate(
  (app) => {
    const tasks = app.findCollectionByNameOrId('tasks')

    tasks.updateRule =
      "@request.auth.role = 'admin' || created_by = @request.auth.id || delegated_to = @request.auth.id"
    app.save(tasks)

    app.db().newQuery('CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks (`order`);').execute()
    app
      .db()
      .newQuery('CREATE INDEX IF NOT EXISTS idx_tasks_status_order ON tasks (status, `order`);')
      .execute()
  },
  (app) => {
    const tasks = app.findCollectionByNameOrId('tasks')
    app.save(tasks)

    app.db().newQuery('DROP INDEX IF EXISTS idx_tasks_order;').execute()
    app.db().newQuery('DROP INDEX IF EXISTS idx_tasks_status_order;').execute()
  },
)
