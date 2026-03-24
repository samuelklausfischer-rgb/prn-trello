import pb from '@/lib/pocketbase/client'

export interface ChecklistRecord {
  id: string
  task_id: string
  title: string
  description?: string
  order: number
  is_completed: boolean
  completed_at?: string
  completed_by?: string
  created: string
  updated: string
  expand?: {
    completed_by?: { id: string; name: string; avatar: string }
  }
}

export const getChecklistsByTask = (taskId: string) =>
  pb.collection('checklists').getFullList<ChecklistRecord>({
    filter: `task_id = "${taskId}"`,
    sort: 'order,created',
    expand: 'completed_by',
  })

export const createChecklist = (data: Partial<ChecklistRecord>) =>
  pb.collection('checklists').create<ChecklistRecord>(data)

export const updateChecklist = (id: string, data: Partial<ChecklistRecord>) =>
  pb.collection('checklists').update<ChecklistRecord>(id, data)

export const deleteChecklist = (id: string) => pb.collection('checklists').delete(id)
