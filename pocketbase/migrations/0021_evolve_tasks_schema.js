migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('tasks')

    col.fields.add(
      new SelectField({
        name: 'deadline_type',
        values: ['mandatory', 'optional'],
        required: false, // Soft requirement to not break existing data inserts abruptly
      }),
    )

    app.save(col)

    // Set default value for existing tasks to ensure backward compatibility
    try {
      app
        .db()
        .newQuery(
          "UPDATE tasks SET deadline_type = 'optional' WHERE deadline_type IS NULL OR deadline_type = ''",
        )
        .execute()
    } catch (e) {
      console.error('Failed to update existing tasks deadline_type', e)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('tasks')
    col.fields.removeByName('deadline_type')
    app.save(col)
  },
)
