migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('projects')

    if (!col.fields.getByName('shared_with_users')) {
      col.fields.add(
        new RelationField({
          name: 'shared_with_users',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 9999,
        }),
      )
    }

    if (!col.fields.getByName('shared_with_roles')) {
      col.fields.add(
        new JSONField({
          name: 'shared_with_roles',
          maxSize: 2000000,
        }),
      )
    }

    col.addIndex('idx_projects_shared_users', false, 'shared_with_users', '')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.removeIndex('idx_projects_shared_users')
    col.fields.removeByName('shared_with_users')
    col.fields.removeByName('shared_with_roles')
    app.save(col)
  },
)
