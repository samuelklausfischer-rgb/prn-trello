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

  const existing = await pb.collection('tasks').getOne<TaskRecord>(id)

  const allowedFields: (keyof TaskRecord)[] = [
    'status',
    'priority',
    'title',
    'description',
    'due_date',
    'deadline_type',
    'started_at',
    'completed_at',
    'created_by',
    'delegated_to',
    'department',
    'tags',
    'is_archived',
    'is_private',
    'points_reward',
    'points_awarded',
  ]

  const payload: Record<string, any> = {}

  for (const key of allowedFields) {
    if (key in data && data[key] !== undefined) {
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

  // Handle status persistence automatically
  if (payload.status === 'done' && existing.status !== 'done') {
    payload.completed_at = new Date().toISOString()
  } else if (payload.status && payload.status !== 'done' && existing.status === 'done') {
    payload.completed_at = ''
  }

  if (payload.status === 'in_progress' && existing.status === 'todo' && !existing.started_at) {
    payload.started_at = new Date().toISOString()
  }

  if (Object.keys(payload).length === 0) {
    return existing
  }

  return await pb.collection('tasks').update<TaskRecord>(id, payload)
}

export const deleteTask = (id: string) => pb.collection('tasks').delete(id)
