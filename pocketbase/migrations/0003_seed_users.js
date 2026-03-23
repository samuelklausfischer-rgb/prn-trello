migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    // Seed Primary Administrator
    const admin = new Record(users)
    admin.setEmail('paulonovack@gmail.com')
    admin.setPassword('securepassword123')
    admin.setVerified(true)
    admin.set('name', 'Paulo Novack')
    admin.set('role', 'admin')
    admin.set('is_active', true)
    admin.set('points', 0)
    admin.set('level', 1)
    admin.set('streak_days', 0)
    admin.set('xp', 0)
    app.save(admin)

    // Seed Demo Employee for testing
    const employee = new Record(users)
    employee.setEmail('joao@prn.com')
    employee.setPassword('func123')
    employee.setVerified(true)
    employee.set('name', 'João Silva')
    employee.set('role', 'employee')
    employee.set('is_active', true)
    employee.set('points', 420)
    employee.set('level', 1)
    employee.set('streak_days', 3)
    employee.set('xp', 100)
    app.save(employee)
  },
  (app) => {
    try {
      const admin = app.findAuthRecordByEmail('users', 'paulonovack@gmail.com')
      app.delete(admin)
    } catch (err) {}

    try {
      const employee = app.findAuthRecordByEmail('users', 'joao@prn.com')
      app.delete(employee)
    } catch (err) {}
  },
)
