migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    if (!col.fields.getByName('job_title')) {
      col.fields.add(new TextField({ name: 'job_title' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    if (col.fields.getByName('job_title')) {
      col.fields.removeByName('job_title')
    }
    app.save(col)
  },
)
