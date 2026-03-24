migrate(
  (app) => {
    const achCol = app.findCollectionByNameOrId('achievements')

    const collection = new Collection({
      name: 'user_achievements',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: null,
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: null,
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'achievement_id',
          type: 'relation',
          required: true,
          collectionId: achCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'progress', type: 'number' },
        { name: 'progress_target', type: 'number', required: true },
        { name: 'unlocked_at', type: 'date' },
        { name: 'is_notified', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_user_achievements_unique ON user_achievements (user_id, achievement_id)',
        'CREATE INDEX idx_user_achievements_unlocked ON user_achievements (unlocked_at DESC)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('user_achievements')
    app.delete(collection)
  },
)
