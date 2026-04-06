migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    // Ensure the update rule explicitly allows admin to edit any record
    users.updateRule =
      "@request.auth.role = 'admin' || (id = @request.auth.id && role = @request.auth.role)"
    app.save(users)

    // Ensure is_active defaults to true for all existing users if not already set
    app
      .db()
      .newQuery(
        "UPDATE users SET is_active = 1 WHERE is_active = 0 OR is_active IS NULL OR is_active = ''",
      )
      .execute()
  },
  (app) => {
    // Revert rule to original if needed
  },
)
