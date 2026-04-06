migrate(
  (app) => {
    let projects
    try {
      projects = app.findCollectionByNameOrId('projects')
    } catch (e) {
      projects = new Collection({
        name: 'projects',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'color', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX `idx_projects_name` ON `projects` (`name`)'],
      })
      app.save(projects)
    }

    const tasks = app.findCollectionByNameOrId('tasks')
    let changed = false

    if (!tasks.fields.getByName('project_id')) {
      tasks.fields.add(
        new RelationField({
          name: 'project_id',
          collectionId: projects.id,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
      changed = true
    }

    if (!tasks.fields.getByName('order')) {
      tasks.fields.add(
        new NumberField({
          name: 'order',
        }),
      )
      changed = true
    }

    if (!tasks.fields.getByName('board_group')) {
      tasks.fields.add(new TextField({ name: 'board_group' }))
      changed = true
    }

    if (!tasks.fields.getByName('is_blocked')) {
      tasks.fields.add(new BoolField({ name: 'is_blocked' }))
      changed = true
    }

    if (!tasks.fields.getByName('block_reason')) {
      tasks.fields.add(new TextField({ name: 'block_reason' }))
      changed = true
    }

    tasks.addIndex('idx_tasks_project_id', false, '`project_id`', '')
    tasks.addIndex('idx_tasks_order', false, '`order`', '')

    if (changed || true) {
      app.save(tasks)
    }
  },
  (app) => {
    try {
      const tasks = app.findCollectionByNameOrId('tasks')
      tasks.removeIndex('idx_tasks_project_id')
      tasks.removeIndex('idx_tasks_order')

      if (tasks.fields.getByName('project_id')) {
        tasks.fields.removeByName('project_id')
      }
      if (tasks.fields.getByName('order')) {
        tasks.fields.removeByName('order')
      }
      if (tasks.fields.getByName('board_group')) {
        tasks.fields.removeByName('board_group')
      }
      if (tasks.fields.getByName('is_blocked')) {
        tasks.fields.removeByName('is_blocked')
      }
      if (tasks.fields.getByName('block_reason')) {
        tasks.fields.removeByName('block_reason')
      }
      app.save(tasks)
    } catch (e) {}

    try {
      const projects = app.findCollectionByNameOrId('projects')
      app.delete(projects)
    } catch (e) {}
  },
)
