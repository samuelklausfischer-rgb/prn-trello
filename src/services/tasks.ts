import pb from '@/lib/pocketbase/client'

export interface TaskRecord {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  started_at?: string
  completed_at?: string
  created_by: string
  delegated_to?: string
  department?: string
  tags?: string[]
  is_archived: boolean
  points_reward: number
  points_awarded: boolean
  created: string
  updated: string
  expand?: {
    created_by?: { id: string; name: string; avatar: string }
    delegated_to?: { id: string; name: string; avatar: string }
  }
}

export const getTasks = () =>
  pb
    .collection('tasks')
    .getFullList<TaskRecord>({ sort: '-created', expand: 'created_by,delegated_to' })

export const getTask = (id: string) =>
  pb.collection('tasks').getOne<TaskRecord>(id, { expand: 'created_by,delegated_to' })

export const createTask = async (data: Partial<TaskRecord>) => {
  const task = await pb.collection('tasks').create<TaskRecord>(data)
  const authId = pb.authStore.record?.id

  if (authId) {
    await pb
      .collection('task_history')
      .create({
        task_id: task.id,
        action: 'TASK_CREATED',
        description: 'Tarefa criada',
        performed_by: authId,
      })
      .catch(console.error)
  }

  return task
}

export const updateTask = async (id: string, data: Partial<TaskRecord>) => {
  const oldTask = await pb.collection('tasks').getOne<TaskRecord>(id)
  const task = await pb.collection('tasks').update<TaskRecord>(id, data)

  const authId = pb.authStore.record?.id
  if (authId) {
    const historyPromises = []
    const statusMap: Record<string, string> = {
      todo: 'A Fazer',
      in_progress: 'Em Progresso',
      review: 'Em Revisão',
      done: 'Concluído',
    }

    if (data.status && data.status !== oldTask.status) {
      const isCompleted = data.status === 'done'
      historyPromises.push(
        pb.collection('task_history').create({
          task_id: id,
          action: isCompleted ? 'TASK_COMPLETED' : 'STATUS_CHANGED',
          description: isCompleted
            ? 'Tarefa marcada como concluída'
            : `Status alterado de ${statusMap[oldTask.status] || oldTask.status} para ${statusMap[data.status] || data.status}`,
          old_value: statusMap[oldTask.status] || oldTask.status,
          new_value: statusMap[data.status] || data.status,
          performed_by: authId,
        }),
      )
    }

    if (data.delegated_to !== undefined && data.delegated_to !== oldTask.delegated_to) {
      historyPromises.push(
        pb.collection('task_history').create({
          task_id: id,
          action: 'DELEGATED',
          description: data.delegated_to
            ? 'Tarefa delegada para outro membro'
            : 'Delegação de tarefa removida',
          old_value: oldTask.delegated_to || 'Nenhum',
          new_value: data.delegated_to || 'Nenhum',
          performed_by: authId,
        }),
      )
    }

    await Promise.allSettled(historyPromises)
  }

  return task
}

export const deleteTask = (id: string) => pb.collection('tasks').delete(id)
