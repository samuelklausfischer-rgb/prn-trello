migrate(
  (app) => {
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
      fields: [
        { name: 'name', type: 'text' },
        { name: 'avatar', type: 'text' },
        { name: 'points', type: 'number' },
        { name: 'level', type: 'number' },
        { name: 'level_name', type: 'text' },
        { name: 'level_icon', type: 'text' },
        { name: 'position', type: 'number' },
      ],
    })
    app.save(vRanking)

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
      fields: [
        { name: 'name', type: 'text' },
        { name: 'points', type: 'number' },
        { name: 'level', type: 'number' },
        { name: 'streak_days', type: 'number' },
        { name: 'total_tasks', type: 'number' },
        { name: 'completed_tasks', type: 'number' },
      ],
    })
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
