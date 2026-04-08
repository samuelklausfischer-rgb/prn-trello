migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('tutorial_progress')) {
      users.fields.add(
        new JSONField({
          name: 'tutorial_progress',
          required: false,
        }),
      )
    }

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (users.fields.getByName('tutorial_progress')) {
      users.fields.removeByName('tutorial_progress')
    }

    app.save(users)
  },
)
