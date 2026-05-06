migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('projects')

    col.updateRule = "@request.auth.id != ''"

    col.fields.add(
      new SelectField({
        name: 'status',
        required: false,
        values: ['active', 'completed', 'on_hold', 'todo', 'in_progress', 'review', 'done'],
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
        required: false,
        values: ['active', 'completed', 'on_hold'],
        maxSelect: 1,
      }),
    )

    app.save(col)
  },
)
