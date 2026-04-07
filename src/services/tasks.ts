import pb from '@/lib/pocketbase/client'

export interface TaskRecord {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  deadline_type?: 'mandatory' | 'optional'
  started_at?: string
  completed_at?: string
  created_by: string
  delegated_to?: string
  department?: string
  tags?: string[]
  is_archived: boolean
  is_private: boolean
  points_reward: number
  points_awarded: boolean
  project_id?: string
  board_group?: string
  order?: number
  is_blocked?: boolean
  block_reason?: string
  created: string
  updated: string
  expand?: {
    created_by?: { id: string; name: string; avatar: string }
    delegated_to?: { id: string; name: string; avatar: string }
    project_id?: { id: string; name: string; color: string }
  }
}

export const getTasks = () =>
  pb.collection('tasks').getFullList<TaskRecord>({
    sort: 'order,-created',
    expand: 'created_by,delegated_to,project_id',
  })

export const getTask = (id: string) =>
  pb.collection('tasks').getOne<TaskRecord>(id, { expand: 'created_by,delegated_to,project_id' })

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

export const updateTaskOrder = async (
  updates: { id: string; order: number; status?: string; project_id?: string }[],
) => {
  return Promise.all(
    updates.map((u) => {
      const payload: Record<string, any> = {
        order: typeof u.order === 'number' && !isNaN(u.order) ? Number(u.order) : 0,
      }
      if (u.status) payload.status = String(u.status)
      if (u.project_id !== undefined) {
        payload.project_id = u.project_id === '' ? null : String(u.project_id)
      }
      return pb.collection('tasks').update(u.id, payload)
    }),
  )
}

export const updateTask = async (
  id: string,
  data: Partial<TaskRecord>,
  optimisticUpdated?: string,
) => {
  if (!id) throw new Error('Task ID is required for update')

  const allowedFields: (keyof TaskRecord)[] = [
    'status',
    'priority',
    'title',
    'description',
    'due_date',
    'deadline_type',
    'delegated_to',
    'department',
    'tags',
    'is_archived',
    'is_private',
    'points_reward',
    'project_id',
    'board_group',
    'order',
    'is_blocked',
    'block_reason',
  ]

  const payload: Record<string, any> = {}

  for (const key of allowedFields) {
    if (key in data && data[key] !== undefined) {
      if (key === 'delegated_to') {
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

  if (Object.keys(payload).length === 0) {
    return await pb.collection('tasks').getOne<TaskRecord>(id)
  }

  const options: any = {}
  if (optimisticUpdated) {
    options.headers = {
      'x-optimistic-updated': optimisticUpdated,
    }
  }

  return await pb.collection('tasks').update<TaskRecord>(id, payload, options)
}

export const deleteTask = (id: string) => pb.collection('tasks').delete(id)
