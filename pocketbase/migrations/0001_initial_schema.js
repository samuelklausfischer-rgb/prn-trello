migrate(
  (app) => {
    // Update users collection
    const usersCol = app.findCollectionByNameOrId('users')
    if (!usersCol.fields.getByName('role')) {
      usersCol.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'employee'],
          maxSelect: 1,
        }),
      )
    }
    app.save(usersCol)

    // Create tasks collection
    const tasksCol = new Collection({
      name: 'tasks',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'status',
          type: 'select',
          values: ['todo', 'in_progress', 'review', 'done'],
          maxSelect: 1,
          required: true,
        },
        {
          name: 'priority',
          type: 'select',
          values: ['low', 'medium', 'high', 'urgent'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(tasksCol)

    // Create alerts collection
    const alertsCol = new Collection({
      name: 'alerts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'type',
          type: 'select',
          values: ['task_deadline', 'performance', 'achievement', 'system', 'custom', 'delegation'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(alertsCol)

    // Create achievements collection
    const achievementsCol = new Collection({
      name: 'achievements',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'category',
          type: 'select',
          values: ['tasks', 'checklists', 'streak', 'collaboration', 'milestone'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(achievementsCol)
  },
  (app) => {
    // Revert achievements collection
    try {
      const achievementsCol = app.findCollectionByNameOrId('achievements')
      app.delete(achievementsCol)
    } catch (e) {}

    // Revert alerts collection
    try {
      const alertsCol = app.findCollectionByNameOrId('alerts')
      app.delete(alertsCol)
    } catch (e) {}

    // Revert tasks collection
    try {
      const tasksCol = app.findCollectionByNameOrId('tasks')
      app.delete(tasksCol)
    } catch (e) {}

    // Revert users collection role field
    try {
      const usersCol = app.findCollectionByNameOrId('users')
      if (usersCol.fields.getByName('role')) {
        usersCol.fields.removeByName('role')
        app.save(usersCol)
      }
    } catch (e) {}
  },
)
