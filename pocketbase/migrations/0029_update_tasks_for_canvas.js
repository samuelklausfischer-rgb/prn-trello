migrate(
  (app) => {
    const tasks = app.findCollectionByNameOrId('tasks')
    const projects = app.findCollectionByNameOrId('projects')

    if (!tasks.fields.getByName('order')) {
      tasks.fields.add(new NumberField({ name: 'order' }))
    }
    if (!tasks.fields.getByName('project_id')) {
      tasks.fields.add(
        new RelationField({ name: 'project_id', collectionId: projects.id, maxSelect: 1 }),
      )
    }
    if (!tasks.fields.getByName('board_group')) {
      tasks.fields.add(new TextField({ name: 'board_group' }))
    }
    app.save(tasks)
  },
  (app) => {
    const tasks = app.findCollectionByNameOrId('tasks')
    tasks.fields.removeByName('order')
    tasks.fields.removeByName('project_id')
    tasks.fields.removeByName('board_group')
    app.save(tasks)
  },
)
