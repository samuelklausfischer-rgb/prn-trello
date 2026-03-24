migrate(
  (app) => {
    // 1. Ranking View
    const vRanking = new Collection({
      name: 'v_ranking',
      type: 'view',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      viewQuery: `SELECT 
          u.id, 
          u.name, 
          u.avatar, 
          u.points, 
          u.level, 
          l.name as level_name, 
          l.icon as level_icon, 
          (SELECT COUNT(id) FROM users u2 WHERE u2.is_active = true AND u2.points > u.points) + 1 as position 
        FROM users u 
        LEFT JOIN levels l ON u.level = l.level_number 
        WHERE u.is_active = true`,
    })

    // Add fields manually using typed constructors to bypass JSON unmarshaling issues.
    // The 'id' field is mandatory for view collections and was missing in the original array.
    vRanking.fields.add(new TextField({ name: 'id' }))
    vRanking.fields.add(new TextField({ name: 'name' }))
    vRanking.fields.add(new TextField({ name: 'avatar' }))
    vRanking.fields.add(new NumberField({ name: 'points' }))
    vRanking.fields.add(new NumberField({ name: 'level' }))
    vRanking.fields.add(new TextField({ name: 'level_name' }))
    vRanking.fields.add(new TextField({ name: 'level_icon' }))
    vRanking.fields.add(new NumberField({ name: 'position' }))

    app.save(vRanking)

    // 2. User Stats View
    const vUserStats = new Collection({
      name: 'v_user_stats',
      type: 'view',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      viewQuery: `SELECT 
          u.id, 
          u.name, 
          u.points, 
          u.level, 
          u.streak_days, 
          CAST(COUNT(t.id) AS INT) as total_tasks, 
          CAST(COALESCE(SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END), 0) AS INT) as completed_tasks 
        FROM users u 
        LEFT JOIN tasks t ON (t.delegated_to = u.id OR t.created_by = u.id) 
        GROUP BY u.id`,
    })

    vUserStats.fields.add(new TextField({ name: 'id' }))
    vUserStats.fields.add(new TextField({ name: 'name' }))
    vUserStats.fields.add(new NumberField({ name: 'points' }))
    vUserStats.fields.add(new NumberField({ name: 'level' }))
    vUserStats.fields.add(new NumberField({ name: 'streak_days' }))
    vUserStats.fields.add(new NumberField({ name: 'total_tasks' }))
    vUserStats.fields.add(new NumberField({ name: 'completed_tasks' }))

    app.save(vUserStats)
  },
  (app) => {
    try {
      const vRanking = app.findCollectionByNameOrId('v_ranking')
      app.delete(vRanking)
    } catch (e) {}

    try {
      const vUserStats = app.findCollectionByNameOrId('v_user_stats')
      app.delete(vUserStats)
    } catch (e) {}
  },
)
