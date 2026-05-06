migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.fields.add(
      new SelectField({
        name: 'status',
        values: ['active', 'completed', 'on_hold'],
        maxSelect: 1,
      }),
    )
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.fields.add(
      new SelectField({
        name: 'status',
        values: ['active', 'completed', 'on_hold'],
      }),
    )
    app.save(col)
  },
)
