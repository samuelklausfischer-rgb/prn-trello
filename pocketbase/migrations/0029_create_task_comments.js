migrate(
  (app) => {
    const taskComments = new Collection({
      name: 'task_comments',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id = user_id || @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id = user_id || @request.auth.role = 'admin'",
      fields: [
        {
          name: 'task_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('tasks').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('users').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'content', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_task_comments_task_id ON task_comments (task_id)',
        'CREATE INDEX idx_task_comments_created ON task_comments (created DESC)',
      ],
    })
    app.save(taskComments)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('task_comments')
      app.delete(collection)
    } catch (e) {}
  },
)
