migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')

    // Select Policy: is_admin() || id = auth.uid()
    usersCol.listRule = "@request.auth.role = 'admin' || id = @request.auth.id"
    usersCol.viewRule = "@request.auth.role = 'admin' || id = @request.auth.id"

    // Update Policy: is_admin() || (id = auth.uid() && role = @request.auth.role)
    usersCol.updateRule =
      "@request.auth.role = 'admin' || (id = @request.auth.id && role = @request.auth.role)"

    app.save(usersCol)
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')

    // Revert back to original rules
    usersCol.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    usersCol.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    usersCol.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"

    app.save(usersCol)
  },
)
