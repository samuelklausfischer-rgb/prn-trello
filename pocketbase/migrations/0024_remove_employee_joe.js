migrate(
  (app) => {
    try {
      const records = app.findRecordsByFilter('users', "name = 'Employee Joe'", '', 100, 0)
      for (const record of records) {
        app.delete(record)
      }
    } catch (err) {
      console.log('Failed to remove Employee Joe:', err)
    }
  },
  (app) => {
    // Down migration intentionally left empty as we cannot safely reconstruct the deleted test user's data (email, password hash, etc.)
  },
)
