migrate(
  (app) => {
    // 1. Admin User Setup
    const users = app.findCollectionByNameOrId('users')
    try {
      app.findAuthRecordByEmail('users', 'samuelklausfischer@hotmail.com')
    } catch (err) {
      const admin = new Record(users)
      admin.setEmail('samuelklausfischer@hotmail.com')
      admin.setPassword('securepassword123')
      admin.setVerified(true)
      admin.set('name', 'Samuel Klaus Fischer')
      admin.set('role', 'admin')
      admin.set('is_active', true)
      admin.set('points', 0)
      admin.set('level', 1)
      admin.set('streak_days', 0)
      admin.set('xp', 0)
      app.save(admin)
    }

    // 2. Clear existing levels to avoid duplicate numbers
    const levelsCol = app.findCollectionByNameOrId('levels')
    try {
      const oldLevels = app.findRecordsByFilter('levels', 'level_number > 0', '', 100, 0)
      oldLevels.forEach((r) => app.delete(r))
    } catch (e) {
      // Ignore if no records found
    }

    // 3. Insert new levels
    const levelsData = [
      { level_number: 1, name: 'Iniciante', min_xp: 0, max_xp: 99, icon: '', color: '#9CA3AF' },
      { level_number: 2, name: 'Aprendiz', min_xp: 100, max_xp: 249, icon: '', color: '#60A5FA' },
      {
        level_number: 3,
        name: 'Produtivo',
        min_xp: 250,
        max_xp: 499,
        icon: 'Zap',
        color: '#34D399',
      },
      { level_number: 4, name: 'Expert', min_xp: 500, max_xp: 999, icon: '', color: '#FBBF24' },
      { level_number: 5, name: 'Mestre', min_xp: 1000, max_xp: 1999, icon: '', color: '#F97316' },
      { level_number: 6, name: 'Lenda', min_xp: 2000, max_xp: 3999, icon: '', color: '#A855F7' },
      {
        level_number: 7,
        name: 'CEO da Produtividade',
        min_xp: 4000,
        max_xp: 999999,
        icon: '',
        color: '#EC4899',
      },
    ]

    levelsData.forEach((d) => {
      const r = new Record(levelsCol)
      r.set('level_number', d.level_number)
      r.set('name', d.name)
      r.set('min_xp', d.min_xp)
      r.set('max_xp', d.max_xp)
      r.set('icon', d.icon)
      r.set('color', d.color)
      app.save(r)
    })

    // 4. Clear existing achievements to avoid duplicate slugs
    const achCol = app.findCollectionByNameOrId('achievements')
    try {
      const oldAchs = app.findRecordsByFilter('achievements', "slug != ''", '', 100, 0)
      oldAchs.forEach((a) => app.delete(a))
    } catch (e) {
      // Ignore if no records found
    }

    // 5. Insert new achievements
    const achsData = [
      {
        name: 'Primeira Tarefa',
        slug: 'first-task',
        description: 'Complete sua primeira tarefa',
        category: 'tasks',
        icon: '',
        requirement_type: 'tasks_completed',
        requirement_value: 1,
        points_reward: 10,
        rarity: 'common',
      },
      {
        name: 'Produtivo',
        slug: 'tasks-10',
        description: 'Complete 10 tarefas',
        category: 'tasks',
        icon: 'Zap',
        requirement_type: 'tasks_completed',
        requirement_value: 10,
        points_reward: 50,
        rarity: 'common',
      },
      {
        name: 'Maquina',
        slug: 'tasks-50',
        description: 'Complete 50 tarefas',
        category: 'tasks',
        icon: '',
        requirement_type: 'tasks_completed',
        requirement_value: 50,
        points_reward: 200,
        rarity: 'rare',
      },
      {
        name: 'Mestre',
        slug: 'tasks-100',
        description: 'Complete 100 tarefas',
        category: 'tasks',
        icon: '',
        requirement_type: 'tasks_completed',
        requirement_value: 100,
        points_reward: 500,
        rarity: 'epic',
      },
      {
        name: 'Organizado',
        slug: 'checklists-10',
        description: 'Complete 10 checklists',
        category: 'checklists',
        icon: '',
        requirement_type: 'checklists_completed',
        requirement_value: 10,
        points_reward: 30,
        rarity: 'common',
      },
      {
        name: 'Detalhista',
        slug: 'checklists-50',
        description: 'Complete 50 checklists',
        category: 'checklists',
        icon: '',
        requirement_type: 'checklists_completed',
        requirement_value: 50,
        points_reward: 150,
        rarity: 'rare',
      },
      {
        name: 'Foco',
        slug: 'streak-7',
        description: '7 dias consecutivos',
        category: 'streak',
        icon: '',
        requirement_type: 'streak_days',
        requirement_value: 7,
        points_reward: 100,
        rarity: 'rare',
      },
      {
        name: 'Dedicacao',
        slug: 'streak-30',
        description: '30 dias consecutivos',
        category: 'streak',
        icon: '',
        requirement_type: 'streak_days',
        requirement_value: 30,
        points_reward: 500,
        rarity: 'epic',
      },
    ]

    achsData.forEach((d) => {
      const r = new Record(achCol)
      r.set('name', d.name)
      r.set('slug', d.slug)
      r.set('description', d.description)
      r.set('category', d.category)
      r.set('icon', d.icon)
      r.set('requirement_type', d.requirement_type)
      r.set('requirement_value', d.requirement_value)
      r.set('points_reward', d.points_reward)
      r.set('xp_reward', 0)
      r.set('rarity', d.rarity)
      r.set('is_active', true)
      r.set('is_hidden', false)
      app.save(r)
    })
  },
  (app) => {
    // Revert admin user creation
    try {
      const user = app.findAuthRecordByEmail('users', 'samuelklausfischer@hotmail.com')
      app.delete(user)
    } catch (err) {}

    // Revert levels creation
    try {
      const levels = app.findRecordsByFilter('levels', 'level_number > 0', '', 100, 0)
      levels.forEach((r) => app.delete(r))
    } catch (e) {}

    // Revert achievements creation
    try {
      const achs = app.findRecordsByFilter('achievements', "slug != ''", '', 100, 0)
      achs.forEach((a) => app.delete(a))
    } catch (e) {}
  },
)
