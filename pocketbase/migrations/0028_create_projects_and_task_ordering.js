migrate(
  (app) => {
    const projects = new Collection({
      name: 'projects',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'color', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(projects)

    const tasks = app.findCollectionByNameOrId('tasks')
    tasks.fields.add(
      new RelationField({ name: 'project_id', collectionId: projects.id, maxSelect: 1 }),
    )
    tasks.fields.add(new NumberField({ name: 'order' }))
    tasks.fields.add(new BoolField({ name: 'is_blocked' }))
    tasks.fields.add(new TextField({ name: 'block_reason' }))

    app.save(tasks)

    tasks.addIndex('idx_tasks_order', false, 'order', '')
    tasks.addIndex('idx_tasks_project_id', false, 'project_id', '')
    app.save(tasks)
  },
  (app) => {
    const tasks = app.findCollectionByNameOrId('tasks')
    tasks.removeIndex('idx_tasks_order')
    tasks.removeIndex('idx_tasks_project_id')
    tasks.fields.removeByName('project_id')
    tasks.fields.removeByName('order')
    tasks.fields.removeByName('is_blocked')
    tasks.fields.removeByName('block_reason')
    app.save(tasks)

    const projects = app.findCollectionByNameOrId('projects')
    app.delete(projects)
  },
)
