export type AdminAnalytics = {
  kpis: { totalTasks: number; overdue: number; completionRate: number; totalPoints: number }
  statusData: { name: string; value: number; key: string }[]
  weeklyData: { day: string; tasks: number }[]
  employeeData: { name: string; tasks: number }[]
  performance: { id: string; name: string; total: number; completed: number; rank: number }[]
}

export type UserAnalytics = {
  kpis: { totalTasks: number; completed: number; completionRate: number; points: number }
  productivityData: { day: string; tasks: number }[]
  progressData: { name: string; value: number; key: string }[]
  teamComparison: { name: string; value: number; type: string }[]
  recentTasks: { id: string; title: string; status: string }[]
  upcomingDeadlines: { id: string; title: string; date: string }[]
}

export const fetchAdminAnalytics = async (timeframe: string): Promise<AdminAnalytics> => {
  await new Promise((r) => setTimeout(r, 600))
  const multiplier = timeframe === 'WEEK' ? 1 : timeframe === 'MONTH' ? 4 : 12

  return {
    kpis: {
      totalTasks: 145 * multiplier,
      overdue: 12 * multiplier,
      completionRate: 85,
      totalPoints: 14500 * multiplier,
    },
    statusData: [
      { name: 'A Fazer', value: 30 * multiplier, key: 'todo' },
      { name: 'Em Progresso', value: 45 * multiplier, key: 'inProgress' },
      { name: 'Em Revisão', value: 20 * multiplier, key: 'review' },
      { name: 'Concluído', value: 50 * multiplier, key: 'done' },
    ],
    weeklyData: [
      { day: 'Seg', tasks: 15 * multiplier },
      { day: 'Ter', tasks: 25 * multiplier },
      { day: 'Qua', tasks: 30 * multiplier },
      { day: 'Qui', tasks: 20 * multiplier },
      { day: 'Sex', tasks: 45 * multiplier },
      { day: 'Sáb', tasks: 10 * multiplier },
      { day: 'Dom', tasks: 5 * multiplier },
    ],
    employeeData: [
      { name: 'João S.', tasks: 45 },
      { name: 'Maria O.', tasks: 38 },
      { name: 'Pedro S.', tasks: 32 },
      { name: 'Ana C.', tasks: 28 },
    ],
    performance: [
      { id: 'u1', name: 'João Silva', total: 50, completed: 45, rank: 1 },
      { id: 'u2', name: 'Maria Oliveira', total: 45, completed: 38, rank: 2 },
      { id: 'u3', name: 'Pedro Souza', total: 40, completed: 32, rank: 3 },
      { id: 'u4', name: 'Ana Costa', total: 35, completed: 28, rank: 4 },
    ],
  }
}

export const fetchUserAnalytics = async (userId: string): Promise<UserAnalytics> => {
  await new Promise((r) => setTimeout(r, 600))
  return {
    kpis: { totalTasks: 24, completed: 20, completionRate: 83, points: 980 },
    productivityData: [
      { day: 'Seg', tasks: 3 },
      { day: 'Ter', tasks: 5 },
      { day: 'Qua', tasks: 4 },
      { day: 'Qui', tasks: 2 },
      { day: 'Sex', tasks: 6 },
      { day: 'Sáb', tasks: 0 },
      { day: 'Dom', tasks: 0 },
    ],
    progressData: [
      { name: 'Concluído', value: 20, key: 'done' },
      { name: 'Em Progresso', value: 3, key: 'inProgress' },
      { name: 'A Fazer', value: 1, key: 'todo' },
    ],
    teamComparison: [
      { name: 'Você', value: 20, type: 'user' },
      { name: 'Média da Equipe', value: 15, type: 'team' },
    ],
    recentTasks: [
      { id: 't1', title: 'Revisão Financeira', status: 'DONE' },
      { id: 't2', title: 'Apresentação Comercial', status: 'IN_PROGRESS' },
      { id: 't3', title: 'Atualizar CRM', status: 'DONE' },
      { id: 't4', title: 'Reunião de Alinhamento', status: 'DONE' },
      { id: 't5', title: 'Relatório Mensal', status: 'TODO' },
    ],
    upcomingDeadlines: [
      { id: 'd1', title: 'Apresentação Comercial', date: 'Hoje, 15:00' },
      { id: 'd2', title: 'Relatório Mensal', date: 'Amanhã, 18:00' },
      { id: 'd3', title: 'Feedback de Clientes', date: '12 de Nov' },
    ],
  }
}
