migrate(
  (app) => {
    const tasksCol = app.findCollectionByNameOrId('tasks')
    const usersCol = app.findCollectionByNameOrId('users')

    const collection = new Collection({
      name: 'checklists',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'task_id',
          type: 'relation',
          required: true,
          collectionId: tasksCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'order', type: 'number', min: 0 },
        { name: 'is_completed', type: 'bool' },
        { name: 'completed_at', type: 'date' },
        { name: 'completed_by', type: 'relation', collectionId: usersCol.id, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_checklists_task_id ON checklists (task_id)',
        'CREATE INDEX idx_checklists_is_completed ON checklists (is_completed)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('checklists')
    app.delete(collection)
  },
)
