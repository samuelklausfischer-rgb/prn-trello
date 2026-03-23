migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    // Update access rules to allow owner or admin
    const adminOrOwner = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.listRule = adminOrOwner
    users.viewRule = adminOrOwner
    users.updateRule = adminOrOwner
    users.deleteRule = adminOrOwner

    // Add Professional Details
    if (!users.fields.getByName('department')) {
      users.fields.add(new TextField({ name: 'department' }))
    }
    if (!users.fields.getByName('phone')) {
      users.fields.add(new TextField({ name: 'phone' }))
    }
    if (!users.fields.getByName('bio')) {
      users.fields.add(new TextField({ name: 'bio' }))
    }
    if (!users.fields.getByName('is_active')) {
      users.fields.add(new BoolField({ name: 'is_active' }))
    }

    // Add Gamification Fields
    if (!users.fields.getByName('points')) {
      users.fields.add(new NumberField({ name: 'points', min: 0 }))
    }
    if (!users.fields.getByName('level')) {
      users.fields.add(new NumberField({ name: 'level', min: 1, max: 10 }))
    }
    if (!users.fields.getByName('xp')) {
      users.fields.add(new NumberField({ name: 'xp', min: 0 }))
    }
    if (!users.fields.getByName('streak_days')) {
      users.fields.add(new NumberField({ name: 'streak_days', min: 0 }))
    }
    if (!users.fields.getByName('last_activity')) {
      users.fields.add(new DateField({ name: 'last_activity' }))
    }

    // Add User Preferences
    if (!users.fields.getByName('notifications_enabled')) {
      users.fields.add(new BoolField({ name: 'notifications_enabled' }))
    }
    if (!users.fields.getByName('dark_mode')) {
      users.fields.add(new BoolField({ name: 'dark_mode' }))
    }
    if (!users.fields.getByName('language')) {
      users.fields.add(new TextField({ name: 'language' }))
    }

    // Add Indexes
    users.addIndex('idx_users_role', false, 'role', '')
    users.addIndex('idx_users_points', false, 'points DESC', '')

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    // Revert access rules
    const ownerOnly = 'id = @request.auth.id'
    users.listRule = ownerOnly
    users.viewRule = ownerOnly
    users.updateRule = ownerOnly
    users.deleteRule = ownerOnly

    // Remove fields
    const fieldsToRemove = [
      'department',
      'phone',
      'bio',
      'is_active',
      'points',
      'level',
      'xp',
      'streak_days',
      'last_activity',
      'notifications_enabled',
      'dark_mode',
      'language',
    ]

    for (const field of fieldsToRemove) {
      if (users.fields.getByName(field)) {
        users.fields.removeByName(field)
      }
    }

    // Remove Indexes
    users.removeIndex('idx_users_role')
    users.removeIndex('idx_users_points')

    app.save(users)
  },
)
