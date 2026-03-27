migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('tasks')
    let hasChanges = false

    if (!col.fields.getByName('due_date')) {
      col.fields.add(new DateField({ name: 'due_date' }))
      hasChanges = true
    }
    if (!col.fields.getByName('started_at')) {
      col.fields.add(new DateField({ name: 'started_at' }))
      hasChanges = true
    }
    if (!col.fields.getByName('completed_at')) {
      col.fields.add(new DateField({ name: 'completed_at' }))
      hasChanges = true
    }
    if (!col.fields.getByName('points_reward')) {
      col.fields.add(new NumberField({ name: 'points_reward' }))
      hasChanges = true
    }
    if (!col.fields.getByName('deadline_type')) {
      col.fields.add(new SelectField({ name: 'deadline_type', values: ['mandatory', 'optional'] }))
      hasChanges = true
    }

    if (hasChanges) {
      app.save(col)
    }
  },
  (app) => {
    // Forward-only migration to ensure fields exist
  },
)
