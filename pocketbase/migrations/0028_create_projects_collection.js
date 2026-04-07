migrate(
  (app) => {
    const projects = new Collection({
      name: 'projects',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.role = 'admin' || created_by = @request.auth.id",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'progress', type: 'number', min: 0, max: 100 },
        {
          name: 'status',
          type: 'select',
          values: ['active', 'completed', 'on_hold'],
          maxSelect: 1,
        },
        { name: 'color', type: 'text' },
        {
          name: 'created_by',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(projects)
  },
  (app) => {
    const projects = app.findCollectionByNameOrId('projects')
    app.delete(projects)
  },
)
