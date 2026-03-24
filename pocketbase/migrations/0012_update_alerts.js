migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('alerts')
    const usersColId = app.findCollectionByNameOrId('users').id

    try {
      app.truncateCollection(col)
    } catch (e) {}

    if (!col.fields.getByName('target_user')) {
      col.fields.add(
        new RelationField({ name: 'target_user', maxSelect: 1, collectionId: usersColId }),
      )
    }
    if (!col.fields.getByName('target_role')) {
      col.fields.add(
        new SelectField({ name: 'target_role', maxSelect: 1, values: ['admin', 'employee'] }),
      )
    }
    if (!col.fields.getByName('title')) {
      col.fields.add(new TextField({ name: 'title', required: true }))
    }
    if (!col.fields.getByName('message')) {
      col.fields.add(new TextField({ name: 'message', required: true }))
    }
    if (!col.fields.getByName('scheduled_for')) {
      col.fields.add(new DateField({ name: 'scheduled_for' }))
    }
    if (!col.fields.getByName('expires_at')) {
      col.fields.add(new DateField({ name: 'expires_at' }))
    }
    if (!col.fields.getByName('action_url')) {
      col.fields.add(new TextField({ name: 'action_url' }))
    }
    if (!col.fields.getByName('created_by')) {
      col.fields.add(
        new RelationField({
          name: 'created_by',
          required: true,
          maxSelect: 1,
          collectionId: usersColId,
        }),
      )
    }
    if (!col.fields.getByName('is_sent')) {
      col.fields.add(new BoolField({ name: 'is_sent' }))
    }
    if (!col.fields.getByName('sent_at')) {
      col.fields.add(new DateField({ name: 'sent_at' }))
    }

    col.listRule = "@request.auth.id != ''"
    col.viewRule = "@request.auth.id != ''"
    col.createRule = "@request.auth.role = 'admin'"
    col.updateRule = "@request.auth.role = 'admin'"
    col.deleteRule = "@request.auth.role = 'admin'"

    col.addIndex('idx_alerts_target_user', false, 'target_user', '')
    col.addIndex('idx_alerts_created_by', false, 'created_by', '')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('alerts')
    col.fields.removeByName('target_user')
    col.fields.removeByName('target_role')
    col.fields.removeByName('title')
    col.fields.removeByName('message')
    col.fields.removeByName('scheduled_for')
    col.fields.removeByName('expires_at')
    col.fields.removeByName('action_url')
    col.fields.removeByName('created_by')
    col.fields.removeByName('is_sent')
    col.fields.removeByName('sent_at')
    col.removeIndex('idx_alerts_target_user')
    col.removeIndex('idx_alerts_created_by')
    app.save(col)
  },
)
