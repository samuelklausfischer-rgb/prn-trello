migrate(
  (app) => {
    const collection = new Collection({
      name: 'v_ranking',
      type: 'view',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      viewQuery:
        'SELECT id, name, avatar, points, level, ROW_NUMBER() OVER(ORDER BY points DESC) as position FROM users WHERE is_active = true',
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('v_ranking')
    app.delete(collection)
  },
)
