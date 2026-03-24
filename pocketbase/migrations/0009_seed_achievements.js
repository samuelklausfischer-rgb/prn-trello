migrate(
  (app) => {
    const achCol = app.findCollectionByNameOrId('achievements')

    try {
      const ach1 = new Record(achCol)
      ach1.set('name', 'Task Master I')
      ach1.set('slug', 'task-master-1')
      ach1.set('description', 'Complete 10 tasks to prove your efficiency.')
      ach1.set('category', 'tasks')
      ach1.set('icon', 'CheckCircle2')
      ach1.set('requirement_type', 'count')
      ach1.set('requirement_value', 10)
      ach1.set('points_reward', 100)
      ach1.set('xp_reward', 50)
      ach1.set('badge_color', '#3b82f6')
      ach1.set('rarity', 'common')
      ach1.set('is_active', true)
      ach1.set('is_hidden', false)
      app.save(ach1)
    } catch (e) {}

    try {
      const ach2 = new Record(achCol)
      ach2.set('name', 'Streak Starter')
      ach2.set('slug', 'streak-starter')
      ach2.set('description', 'Maintain a 3 day login streak to build momentum.')
      ach2.set('category', 'streak')
      ach2.set('icon', 'Flame')
      ach2.set('requirement_type', 'days')
      ach2.set('requirement_value', 3)
      ach2.set('points_reward', 50)
      ach2.set('xp_reward', 20)
      ach2.set('badge_color', '#f97316')
      ach2.set('rarity', 'uncommon')
      ach2.set('is_active', true)
      ach2.set('is_hidden', false)
      app.save(ach2)
    } catch (e) {}
  },
  (app) => {
    try {
      const achs = app.findRecordsByFilter(
        'achievements',
        "slug = 'task-master-1' || slug = 'streak-starter'",
        '',
        100,
        0,
      )
      achs.forEach((a) => app.delete(a))
    } catch (_) {}
  },
)
