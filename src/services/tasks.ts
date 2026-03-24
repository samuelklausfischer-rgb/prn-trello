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
export const createTask = (data: Partial<TaskRecord>) =>
  pb.collection('tasks').create<TaskRecord>(data)
export const updateTask = (id: string, data: Partial<TaskRecord>) =>
  pb.collection('tasks').update<TaskRecord>(id, data)
export const deleteTask = (id: string) => pb.collection('tasks').delete(id)
