migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('notifications')

    collection.fields.add(
      new RelationField({
        name: 'sender',
        collectionId: app.findCollectionByNameOrId('_pb_users_auth_').id,
        cascadeDelete: false,
        maxSelect: 1,
        required: false,
      }),
    )

    collection.fields.add(
      new BoolField({
        name: 'is_archived',
      }),
    )

    app.save(collection)

    // Default existing records to not archived
    app.db().newQuery('UPDATE notifications SET is_archived = false').execute()
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('notifications')
    collection.fields.removeByName('sender')
    collection.fields.removeByName('is_archived')
    app.save(collection)
  },
)
