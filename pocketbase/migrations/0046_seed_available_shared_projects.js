migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    let adminId = ''
    try {
      const admin = app.findFirstRecordByData('users', 'email', 'samuelklausfischer@hotmail.com')
      adminId = admin.id
    } catch (_) {
      // Fallback to any user if admin email isn't found
      try {
        const anyUser = app.findFirstRecordByFilter('users', "id != ''")
        adminId = anyUser.id
      } catch (_) {
        return // skip if no users in the system
      }
    }

    const projectsCol = app.findCollectionByNameOrId('projects')

    // 1. Seed Available Project
    try {
      app.findFirstRecordByData('projects', 'name', 'Projeto Disponível (Pegar)')
    } catch (_) {
      const p1 = new Record(projectsCol)
      p1.set('name', 'Projeto Disponível (Pegar)')
      p1.set('description', 'Projeto para ser assumido por qualquer colaborador da equipe.')
      p1.set('status', 'on_hold')
      p1.set('progress', 0)
      p1.set('color', '#f59e0b')
      p1.set('created_by', adminId)
      p1.set('shared_with_roles', ['employee', 'admin', 'Desenvolvedor'])
      app.save(p1)
    }

    // 2. Seed Shared Project
    try {
      app.findFirstRecordByData('projects', 'name', 'Projeto Compartilhado de Exemplo')
    } catch (_) {
      const p2 = new Record(projectsCol)
      p2.set('name', 'Projeto Compartilhado de Exemplo')
      p2.set('description', 'Este é um projeto colaborativo onde você foi adicionado como membro.')
      p2.set('status', 'active')
      p2.set('progress', 25)
      p2.set('color', '#8b5cf6')
      p2.set('created_by', adminId)
      p2.set('shared_with_roles', ['employee', 'admin', 'Desenvolvedor', 'Designer'])
      app.save(p2)
    }
  },
  (app) => {
    try {
      const p1 = app.findFirstRecordByData('projects', 'name', 'Projeto Disponível (Pegar)')
      app.delete(p1)
    } catch (_) {}
    try {
      const p2 = app.findFirstRecordByData('projects', 'name', 'Projeto Compartilhado de Exemplo')
      app.delete(p2)
    } catch (_) {}
  },
)
