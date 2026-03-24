migrate(
  (app) => {
    const tasks = app.findCollectionByNameOrId('tasks')
    const usersCol = app.findCollectionByNameOrId('users')

    if (!tasks.fields.getByName('title'))
      tasks.fields.add(new TextField({ name: 'title', required: true }))
    if (!tasks.fields.getByName('description'))
      tasks.fields.add(new TextField({ name: 'description' }))
    if (!tasks.fields.getByName('due_date')) tasks.fields.add(new DateField({ name: 'due_date' }))
    if (!tasks.fields.getByName('started_at'))
      tasks.fields.add(new DateField({ name: 'started_at' }))
    if (!tasks.fields.getByName('completed_at'))
      tasks.fields.add(new DateField({ name: 'completed_at' }))
    if (!tasks.fields.getByName('created_by'))
      tasks.fields.add(
        new RelationField({
          name: 'created_by',
          required: true,
          collectionId: usersCol.id,
          maxSelect: 1,
        }),
      )
    if (!tasks.fields.getByName('delegated_to'))
      tasks.fields.add(
        new RelationField({ name: 'delegated_to', collectionId: usersCol.id, maxSelect: 1 }),
      )
    if (!tasks.fields.getByName('department'))
      tasks.fields.add(new TextField({ name: 'department' }))
    if (!tasks.fields.getByName('tags')) tasks.fields.add(new JSONField({ name: 'tags' }))
    if (!tasks.fields.getByName('is_archived'))
      tasks.fields.add(new BoolField({ name: 'is_archived' }))
    if (!tasks.fields.getByName('points_reward'))
      tasks.fields.add(new NumberField({ name: 'points_reward', min: 0 }))
    if (!tasks.fields.getByName('points_awarded'))
      tasks.fields.add(new BoolField({ name: 'points_awarded' }))

    tasks.addIndex('idx_tasks_status', false, 'status', '')
    tasks.addIndex('idx_tasks_created_by', false, 'created_by', '')
    tasks.addIndex('idx_tasks_delegated_to', false, 'delegated_to', '')
    tasks.addIndex('idx_tasks_due_date', false, 'due_date', '')
    tasks.addIndex('idx_tasks_delegated_status', false, 'delegated_to, status', '')

    app.save(tasks)
  },
  (app) => {
    const tasks = app.findCollectionByNameOrId('tasks')

    const fieldsToRemove = [
      'title',
      'description',
      'due_date',
      'started_at',
      'completed_at',
      'created_by',
      'delegated_to',
      'department',
      'tags',
      'is_archived',
      'points_reward',
      'points_awarded',
    ]
    for (const f of fieldsToRemove) {
      if (tasks.fields.getByName(f)) tasks.fields.removeByName(f)
    }

    tasks.removeIndex('idx_tasks_status')
    tasks.removeIndex('idx_tasks_created_by')
    tasks.removeIndex('idx_tasks_delegated_to')
    tasks.removeIndex('idx_tasks_due_date')
    tasks.removeIndex('idx_tasks_delegated_status')

    app.save(tasks)
  },
)
