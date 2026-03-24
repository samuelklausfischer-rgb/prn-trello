migrate(
  (app) => {
    const lvlsCol = app.findCollectionByNameOrId('levels')

    const data = [
      {
        level_number: 1,
        name: 'Iniciante',
        min_xp: 0,
        max_xp: 100,
        icon: 'Star',
        color: '#64748b',
      },
      {
        level_number: 2,
        name: 'Colaborador',
        min_xp: 101,
        max_xp: 500,
        icon: 'Award',
        color: '#3b82f6',
      },
      {
        level_number: 3,
        name: 'Especialista',
        min_xp: 501,
        max_xp: 1500,
        icon: 'Zap',
        color: '#10b981',
      },
      {
        level_number: 4,
        name: 'Mestre',
        min_xp: 1501,
        max_xp: 5000,
        icon: 'Flame',
        color: '#f59e0b',
      },
      {
        level_number: 5,
        name: 'Lenda',
        min_xp: 5001,
        max_xp: 99999,
        icon: 'Crown',
        color: '#8b5cf6',
      },
    ]

    data.forEach((d) => {
      try {
        const r = new Record(lvlsCol)
        r.set('level_number', d.level_number)
        r.set('name', d.name)
        r.set('min_xp', d.min_xp)
        r.set('max_xp', d.max_xp)
        r.set('icon', d.icon)
        r.set('color', d.color)
        app.save(r)
      } catch (e) {
        console.log('Error seeding level:', e)
      }
    })
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter('levels', 'level_number > 0', '', 100, 0)
      records.forEach((r) => app.delete(r))
    } catch (_) {}
  },
)
