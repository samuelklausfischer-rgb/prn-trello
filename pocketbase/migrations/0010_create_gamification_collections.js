migrate(
  (app) => {
    const usersColId = app.findCollectionByNameOrId('users').id

    const pointsHistory = new Collection({
      name: 'points_history',
      type: 'base',
      listRule: "@request.auth.id = user_id || @request.auth.role = 'admin'",
      viewRule: "@request.auth.id = user_id || @request.auth.role = 'admin'",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersColId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'points', type: 'number', required: true },
        { name: 'reason', type: 'text', required: true },
        { name: 'source_type', type: 'text', required: true },
        { name: 'source_id', type: 'text' },
        { name: 'balance_after', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_points_history_user ON points_history (user_id)'],
    })
    app.save(pointsHistory)

    const levels = new Collection({
      name: 'levels',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'level_number', type: 'number', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'min_xp', type: 'number', required: true },
        { name: 'max_xp', type: 'number', required: true },
        { name: 'icon', type: 'text' },
        { name: 'color', type: 'text' },
        { name: 'rewards', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_levels_number ON levels (level_number)'],
    })
    app.save(levels)
  },
  (app) => {
    try {
      const ph = app.findCollectionByNameOrId('points_history')
      app.delete(ph)
    } catch (_) {}
    try {
      const lvls = app.findCollectionByNameOrId('levels')
      app.delete(lvls)
    } catch (_) {}
  },
)
