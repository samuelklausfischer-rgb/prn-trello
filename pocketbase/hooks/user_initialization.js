onRecordCreateRequest((e) => {
  const record = e.record

  // Role assignment logic
  const role = record.get('role')
  if (role !== 'admin' && role !== 'employee') {
    record.set('role', 'employee')
  }

  // Name assignment logic
  const name = record.get('name')
  if (!name || name.trim() === '') {
    const email = record.get('email') || ''
    const defaultName = email.split('@')[0] || 'User'
    record.set('name', defaultName)
  }

  // Integrity Constraints as per acceptance criteria
  record.set('is_active', true)
  record.set('points', 0)
  record.set('level', 1)
  record.set('streak_days', 0)
  record.set('xp', 0)

  e.next()
}, 'users')
