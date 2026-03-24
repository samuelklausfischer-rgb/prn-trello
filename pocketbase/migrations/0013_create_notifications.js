migrate(
  (app) => {
    const usersColId = app.findCollectionByNameOrId('users').id
    const alertsColId = app.findCollectionByNameOrId('alerts').id

    const col = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      createRule: null,
      updateRule: 'user = @request.auth.id',
      deleteRule: 'user = @request.auth.id',
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: usersColId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'alert',
          type: 'relation',
          collectionId: alertsColId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'message', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['task_deadline', 'performance', 'achievement', 'system', 'custom', 'delegation'],
        },
        { name: 'action_url', type: 'text' },
        { name: 'is_read', type: 'bool' },
        { name: 'read_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notifications_user ON notifications (user)',
        'CREATE INDEX idx_notifications_user_is_read ON notifications (user, is_read)',
      ],
    })
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('notifications')
    app.delete(col)
  },
)
