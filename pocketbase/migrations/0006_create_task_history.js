migrate(
  (app) => {
    const tasksCol = app.findCollectionByNameOrId('tasks')
    const usersCol = app.findCollectionByNameOrId('users')

    const collection = new Collection({
      name: 'task_history',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'task_id',
          type: 'relation',
          required: true,
          collectionId: tasksCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'action', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'old_value', type: 'text' },
        { name: 'new_value', type: 'text' },
        {
          name: 'performed_by',
          type: 'relation',
          required: true,
          collectionId: usersCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'performed_at', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'metadata', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_task_history_task_id ON task_history (task_id)',
        'CREATE INDEX idx_task_history_performed_at ON task_history (performed_at DESC)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('task_history')
    app.delete(collection)
  },
)
