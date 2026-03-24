migrate(
  (app) => {
    // 1. users
    try {
      const usersCol = app.findCollectionByNameOrId('users')
      usersCol.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
      usersCol.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'"
      usersCol.createRule = ''
      usersCol.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
      usersCol.deleteRule = "id = @request.auth.id || @request.auth.role = 'admin'"
      app.save(usersCol)
    } catch (e) {
      console.log('Failed to update users rules:', e)
    }

    // 2. tasks
    try {
      const tasksCol = app.findCollectionByNameOrId('tasks')
      tasksCol.listRule = "@request.auth.id != ''"
      tasksCol.viewRule = "@request.auth.id != ''"
      tasksCol.createRule = "@request.auth.id != ''"
      tasksCol.updateRule = "created_by = @request.auth.id || @request.auth.role = 'admin'"
      tasksCol.deleteRule = "created_by = @request.auth.id || @request.auth.role = 'admin'"
      app.save(tasksCol)
    } catch (e) {
      console.log('Failed to update tasks rules:', e)
    }

    // 3. checklists
    try {
      const checklistsCol = app.findCollectionByNameOrId('checklists')
      checklistsCol.listRule = "@request.auth.id != ''"
      checklistsCol.viewRule = "@request.auth.id != ''"
      const chkWriteRule =
        "task_id.created_by = @request.auth.id || task_id.delegated_to = @request.auth.id || @request.auth.role = 'admin'"
      checklistsCol.createRule = chkWriteRule
      checklistsCol.updateRule = chkWriteRule
      checklistsCol.deleteRule = chkWriteRule
      app.save(checklistsCol)
    } catch (e) {
      console.log('Failed to update checklists rules:', e)
    }

    // 4. task_history
    try {
      const thCol = app.findCollectionByNameOrId('task_history')
      thCol.listRule = "@request.auth.id != ''"
      thCol.viewRule = "@request.auth.id != ''"
      thCol.createRule = "@request.auth.role = 'admin'"
      thCol.updateRule = "@request.auth.role = 'admin'"
      thCol.deleteRule = "@request.auth.role = 'admin'"
      app.save(thCol)
    } catch (e) {
      console.log('Failed to update task_history rules:', e)
    }

    // 5. achievements
    try {
      const achCol = app.findCollectionByNameOrId('achievements')
      achCol.listRule = "@request.auth.id != ''"
      achCol.viewRule = "@request.auth.id != ''"
      achCol.createRule = "@request.auth.role = 'admin'"
      achCol.updateRule = "@request.auth.role = 'admin'"
      achCol.deleteRule = "@request.auth.role = 'admin'"
      app.save(achCol)
    } catch (e) {
      console.log('Failed to update achievements rules:', e)
    }

    // 6. user_achievements
    try {
      const uaCol = app.findCollectionByNameOrId('user_achievements')
      uaCol.listRule = "user_id = @request.auth.id || @request.auth.role = 'admin'"
      uaCol.viewRule = "user_id = @request.auth.id || @request.auth.role = 'admin'"
      uaCol.createRule = "@request.auth.role = 'admin'"
      uaCol.updateRule = "@request.auth.role = 'admin'"
      uaCol.deleteRule = "@request.auth.role = 'admin'"
      app.save(uaCol)
    } catch (e) {
      console.log('Failed to update user_achievements rules:', e)
    }

    // 7. points_history
    try {
      const phCol = app.findCollectionByNameOrId('points_history')
      phCol.listRule = "user_id = @request.auth.id || @request.auth.role = 'admin'"
      phCol.viewRule = "user_id = @request.auth.id || @request.auth.role = 'admin'"
      phCol.createRule = "@request.auth.role = 'admin'"
      phCol.updateRule = "@request.auth.role = 'admin'"
      phCol.deleteRule = "@request.auth.role = 'admin'"
      app.save(phCol)
    } catch (e) {
      console.log('Failed to update points_history rules:', e)
    }

    // 8. alerts
    try {
      const alertsCol = app.findCollectionByNameOrId('alerts')
      alertsCol.listRule =
        "target_user = @request.auth.id || target_role = @request.auth.role || @request.auth.role = 'admin'"
      alertsCol.viewRule =
        "target_user = @request.auth.id || target_role = @request.auth.role || @request.auth.role = 'admin'"
      alertsCol.createRule = "@request.auth.role = 'admin'"
      alertsCol.updateRule = "@request.auth.role = 'admin'"
      alertsCol.deleteRule = "@request.auth.role = 'admin'"
      app.save(alertsCol)
    } catch (e) {
      console.log('Failed to update alerts rules:', e)
    }

    // 9. notifications
    try {
      const notifCol = app.findCollectionByNameOrId('notifications')
      notifCol.listRule = 'user = @request.auth.id'
      notifCol.viewRule = 'user = @request.auth.id'
      notifCol.updateRule = 'user = @request.auth.id'
      notifCol.deleteRule = 'user = @request.auth.id'
      app.save(notifCol)
    } catch (e) {
      console.log('Failed to update notifications rules:', e)
    }
  },
  (app) => {
    // Revert users
    try {
      const usersCol = app.findCollectionByNameOrId('users')
      usersCol.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
      usersCol.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'"
      usersCol.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
      usersCol.deleteRule = "id = @request.auth.id || @request.auth.role = 'admin'"
      app.save(usersCol)
    } catch (e) {}

    // Revert tasks
    try {
      const tasksCol = app.findCollectionByNameOrId('tasks')
      tasksCol.listRule = "@request.auth.id != ''"
      tasksCol.viewRule = "@request.auth.id != ''"
      tasksCol.createRule = "@request.auth.id != ''"
      tasksCol.updateRule = "@request.auth.id != ''"
      tasksCol.deleteRule = "@request.auth.id != ''"
      app.save(tasksCol)
    } catch (e) {}

    // Revert checklists
    try {
      const checklistsCol = app.findCollectionByNameOrId('checklists')
      checklistsCol.listRule = "@request.auth.id != ''"
      checklistsCol.viewRule = "@request.auth.id != ''"
      checklistsCol.createRule = "@request.auth.id != ''"
      checklistsCol.updateRule = "@request.auth.id != ''"
      checklistsCol.deleteRule = "@request.auth.id != ''"
      app.save(checklistsCol)
    } catch (e) {}

    // Revert task_history
    try {
      const thCol = app.findCollectionByNameOrId('task_history')
      thCol.listRule = "@request.auth.id != ''"
      thCol.viewRule = "@request.auth.id != ''"
      thCol.createRule = "@request.auth.id != ''"
      thCol.updateRule = null
      thCol.deleteRule = null
      app.save(thCol)
    } catch (e) {}

    // Revert achievements
    try {
      const achCol = app.findCollectionByNameOrId('achievements')
      achCol.listRule = "@request.auth.id != ''"
      achCol.viewRule = "@request.auth.id != ''"
      achCol.createRule = "@request.auth.id != ''"
      achCol.updateRule = "@request.auth.id != ''"
      achCol.deleteRule = "@request.auth.id != ''"
      app.save(achCol)
    } catch (e) {}

    // Revert user_achievements
    try {
      const uaCol = app.findCollectionByNameOrId('user_achievements')
      uaCol.listRule = "@request.auth.id != '' && user_id = @request.auth.id"
      uaCol.viewRule = "@request.auth.id != '' && user_id = @request.auth.id"
      uaCol.createRule = null
      uaCol.updateRule = "@request.auth.id != '' && user_id = @request.auth.id"
      uaCol.deleteRule = null
      app.save(uaCol)
    } catch (e) {}

    // Revert points_history
    try {
      const phCol = app.findCollectionByNameOrId('points_history')
      phCol.listRule = "@request.auth.id = user_id || @request.auth.role = 'admin'"
      phCol.viewRule = "@request.auth.id = user_id || @request.auth.role = 'admin'"
      phCol.createRule = "@request.auth.id != ''"
      phCol.updateRule = null
      phCol.deleteRule = null
      app.save(phCol)
    } catch (e) {}

    // Revert alerts
    try {
      const alertsCol = app.findCollectionByNameOrId('alerts')
      alertsCol.listRule = "@request.auth.id != ''"
      alertsCol.viewRule = "@request.auth.id != ''"
      alertsCol.createRule = "@request.auth.role = 'admin'"
      alertsCol.updateRule = "@request.auth.role = 'admin'"
      alertsCol.deleteRule = "@request.auth.role = 'admin'"
      app.save(alertsCol)
    } catch (e) {}
  },
)
