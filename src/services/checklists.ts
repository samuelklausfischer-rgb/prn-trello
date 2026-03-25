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

export const getChecklists = () =>
  pb.collection('checklists').getFullList<ChecklistRecord>({
    sort: 'order,created',
    expand: 'completed_by',
  })

export const getChecklistsByTask = (taskId: string) =>
  pb.collection('checklists').getFullList<ChecklistRecord>({
    filter: `task_id = "${taskId}"`,
    sort: 'order,created',
    expand: 'completed_by',
  })

export const createChecklist = (data: Partial<ChecklistRecord>) =>
  pb.collection('checklists').create<ChecklistRecord>(data)

export const updateChecklist = async (id: string, data: Partial<ChecklistRecord>) => {
  const oldItem = await pb.collection('checklists').getOne<ChecklistRecord>(id)
  const item = await pb.collection('checklists').update<ChecklistRecord>(id, data)

  const authId = pb.authStore.record?.id
  if (authId && data.is_completed && !oldItem.is_completed) {
    await pb
      .collection('task_history')
      .create({
        task_id: item.task_id,
        action: 'CHECKLIST_COMPLETED',
        description: `Item do checklist concluído: ${item.title}`,
        performed_by: authId,
      })
      .catch(console.error)
  }

  return item
}

export const deleteChecklist = (id: string) => pb.collection('checklists').delete(id)
