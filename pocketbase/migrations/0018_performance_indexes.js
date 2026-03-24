migrate(
  (app) => {
    // 1. Tasks Indexes
    const tasks = app.findCollectionByNameOrId('tasks')
    tasks.addIndex(
      'idx_tasks_active_filter',
      false,
      'delegated_to, created_by, status',
      'is_archived = false',
    )
    tasks.addIndex('idx_tasks_overdue', false, 'delegated_to, due_date', "status != 'done'")
    tasks.addIndex('idx_tasks_title_search', false, 'title', '')
    app.save(tasks)

    // 2. Users Indexes
    const users = app.findCollectionByNameOrId('users')
    users.addIndex('idx_users_active_points', false, 'points DESC', 'is_active = true')
    users.addIndex('idx_users_name_search', false, 'name', '')
    app.save(users)

    // 3. Notifications Indexes
    const notifications = app.findCollectionByNameOrId('notifications')
    notifications.addIndex('idx_notifications_unread', false, 'user, is_read, created DESC', '')
    app.save(notifications)
  },
  (app) => {
    // Revert Tasks Indexes
    const tasks = app.findCollectionByNameOrId('tasks')
    tasks.removeIndex('idx_tasks_active_filter')
    tasks.removeIndex('idx_tasks_overdue')
    tasks.removeIndex('idx_tasks_title_search')
    app.save(tasks)

    // Revert Users Indexes
    const users = app.findCollectionByNameOrId('users')
    users.removeIndex('idx_users_active_points')
    users.removeIndex('idx_users_name_search')
    app.save(users)

    // Revert Notifications Indexes
    const notifications = app.findCollectionByNameOrId('notifications')
    notifications.removeIndex('idx_notifications_unread')
    app.save(notifications)
  },
)
