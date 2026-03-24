migrate(
  (app) => {
    const tasksCol = app.findCollectionByNameOrId('tasks')
    const usersCol = app.findCollectionByNameOrId('users')

    let adminUser
    try {
      adminUser = app.findAuthRecordByEmail('users', 'samuelklausfischer@hotmail.com')
    } catch (_) {
      adminUser = new Record(usersCol)
      adminUser.setEmail('samuelklausfischer@hotmail.com')
      adminUser.setPassword('securepassword123')
      adminUser.setVerified(true)
      adminUser.set('name', 'Samuel Fischer')
      adminUser.set('role', 'admin')
      app.save(adminUser)
    }

    let empUser
    try {
      empUser = app.findAuthRecordByEmail('users', 'employee@example.com')
    } catch (_) {
      empUser = new Record(usersCol)
      empUser.setEmail('employee@example.com')
      empUser.setPassword('securepassword123')
      empUser.setVerified(true)
      empUser.set('name', 'Employee Joe')
      empUser.set('role', 'employee')
      app.save(empUser)
    }

    const t1 = new Record(tasksCol)
    t1.set('title', 'Finalize Monthly Report')
    t1.set('description', 'Complete the financial report for this month.')
    t1.set('status', 'todo')
    t1.set('priority', 'high')
    t1.set('created_by', adminUser.id)
    t1.set('delegated_to', adminUser.id)
    t1.set('points_reward', 50)
    app.save(t1)

    const t2 = new Record(tasksCol)
    t2.set('title', 'Update Client CRM')
    t2.set('description', 'Add the new clients to the database.')
    t2.set('status', 'in_progress')
    t2.set('priority', 'medium')
    t2.set('created_by', adminUser.id)
    t2.set('delegated_to', empUser.id)
    t2.set('points_reward', 30)
    app.save(t2)

    const t3 = new Record(tasksCol)
    t3.set('title', 'Internal Audit')
    t3.set('description', 'Review the internal processes.')
    t3.set('status', 'review')
    t3.set('priority', 'urgent')
    t3.set('created_by', adminUser.id)
    t3.set('delegated_to', adminUser.id)
    t3.set('points_reward', 100)
    app.save(t3)
  },
  (app) => {
    app.db().newQuery('DELETE FROM tasks').execute()
  },
)
