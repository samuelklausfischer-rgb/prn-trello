migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    if (!col.fields.getByName('is_available')) {
      col.fields.add(new BoolField({ name: 'is_available' }))
    }
    col.addIndex('idx_projects_is_available', false, 'is_available', '')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.fields.removeByName('is_available')
    col.removeIndex('idx_projects_is_available')
    app.save(col)
  },
)
