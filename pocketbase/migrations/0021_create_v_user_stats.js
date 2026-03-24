migrate(
  (app) => {
    const collection = new Collection({
      name: 'v_user_stats',
      type: 'view',
      listRule: "id = @request.auth.id || @request.auth.role = 'admin'",
      viewRule: "id = @request.auth.id || @request.auth.role = 'admin'",
      viewQuery: `
        SELECT 
          u.id, 
          u.name, 
          u.points, 
          u.level, 
          u.streak_days, 
          u.xp, 
          COUNT(DISTINCT t.id) as total_tasks, 
          COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks, 
          CAST(
            CASE 
              WHEN COUNT(DISTINCT t.id) = 0 THEN 0 
              ELSE (COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) * 100.0) / COUNT(DISTINCT t.id) 
            END AS INTEGER
          ) as completion_rate 
        FROM users u 
        LEFT JOIN tasks t ON t.created_by = u.id OR t.delegated_to = u.id 
        GROUP BY u.id
      `,
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('v_user_stats')
    app.delete(collection)
  },
)
