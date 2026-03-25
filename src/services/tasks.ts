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

  const allowedFields = [
    'title',
    'description',
    'status',
    'priority',
    'due_date',
    'started_at',
    'completed_at',
    'delegated_to',
    'department',
    'tags',
    'is_archived',
    'points_reward',
    'points_awarded',
  ]

  const payload: Record<string, any> = {}
  let hasChanges = false

  for (const key of allowedFields) {
    if (key in data) {
      const newValue = (data as any)[key]
      const oldValue = (oldTask as any)[key]

      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        payload[key] = newValue
        hasChanges = true
      }
    }
  }

  if (!hasChanges) {
    return oldTask
  }

  const task = await pb.collection('tasks').update<TaskRecord>(id, payload)

  const authId = pb.authStore.record?.id
  if (authId) {
    const historyPromises = []
    const statusMap: Record<string, string> = {
      todo: 'A Fazer',
      in_progress: 'Em Progresso',
      review: 'Em Revisão',
      done: 'Concluído',
    }

    if (payload.status) {
      const isCompleted = payload.status === 'done'
      historyPromises.push(
        pb.collection('task_history').create({
          task_id: id,
          action: isCompleted ? 'TASK_COMPLETED' : 'STATUS_CHANGED',
          description: isCompleted
            ? 'Tarefa marcada como concluída'
            : `Status alterado de ${statusMap[oldTask.status] || oldTask.status} para ${statusMap[payload.status] || payload.status}`,
          old_value: statusMap[oldTask.status] || oldTask.status,
          new_value: statusMap[payload.status] || payload.status,
          performed_by: authId,
        }),
      )
    }

    if ('delegated_to' in payload) {
      historyPromises.push(
        pb.collection('task_history').create({
          task_id: id,
          action: 'DELEGATED',
          description: payload.delegated_to
            ? 'Tarefa delegada para outro membro'
            : 'Delegação de tarefa removida',
          old_value: oldTask.delegated_to || 'Nenhum',
          new_value: payload.delegated_to || 'Nenhum',
          performed_by: authId,
        }),
      )
    }

    await Promise.allSettled(historyPromises)
  }

  return task
}

export const deleteTask = (id: string) => pb.collection('tasks').delete(id)
