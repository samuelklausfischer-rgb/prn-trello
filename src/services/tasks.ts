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
  if (!id) throw new Error('Task ID is required for update')

  const oldTask = await pb.collection('tasks').getOne<TaskRecord>(id)

  // Strictly define fields that can be updated, excluding system fields like id, created, updated, and expand
  const allowedFields: (keyof TaskRecord)[] = [
    'status',
    'priority',
    'title',
    'description',
    'due_date',
    'started_at',
    'completed_at',
    'created_by',
    'delegated_to',
    'department',
    'tags',
    'is_archived',
    'points_reward',
    'points_awarded',
  ]

  const payload: Record<string, any> = {}

  // Filter payload to avoid sending read-only system fields and causing 400 Bad Request
  for (const key of allowedFields) {
    if (key in data && data[key] !== undefined) {
      // Data Integrity: Relation fields must be sent as string IDs, never as full objects
      if (key === 'created_by' || key === 'delegated_to') {
        const val = data[key]
        if (val && typeof val === 'object' && 'id' in val) {
          payload[key] = (val as any).id
        } else {
          payload[key] = val
        }
      } else {
        payload[key] = data[key]
      }
    }
  }

  // Validate that status only contains the correct enum values
  const validStatuses = ['todo', 'in_progress', 'review', 'done']
  if (payload.status && !validStatuses.includes(payload.status)) {
    throw new Error(`Invalid status: ${payload.status}. Must be one of ${validStatuses.join(', ')}`)
  }

  // Handle automatic timestamp updates based on status change, using valid ISO 8601 strings
  if (payload.status) {
    if (payload.status === 'in_progress' && !oldTask.started_at) {
      payload.started_at = new Date().toISOString()
    }
    if (payload.status === 'done' && !oldTask.completed_at) {
      payload.completed_at = new Date().toISOString()
    } else if (payload.status !== 'done' && oldTask.completed_at) {
      // PocketBase requires empty string "" to clear date fields, not null
      payload.completed_at = ''
    }
  }

  // If no fields are to be updated, skip the API call
  if (Object.keys(payload).length === 0) {
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

    if (payload.status && payload.status !== oldTask.status) {
      const isCompleted = payload.status === 'done'
      historyPromises.push(
        pb.collection('task_history').create({
          task_id: task.id,
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

    if (payload.delegated_to !== undefined && payload.delegated_to !== oldTask.delegated_to) {
      historyPromises.push(
        pb.collection('task_history').create({
          task_id: task.id,
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

    if (historyPromises.length > 0) {
      await Promise.allSettled(historyPromises)
    }
  }

  return task
}

export const deleteTask = (id: string) => pb.collection('tasks').delete(id)
