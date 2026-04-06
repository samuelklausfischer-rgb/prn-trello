import pb from '@/lib/pocketbase/client'

export interface TaskCommentRecord {
  id: string
  task_id: string
  user_id: string
  content: string
  created: string
  updated: string
  expand?: {
    user_id?: { id: string; name: string; avatar: string }
  }
}

export const getTaskComments = (taskId: string) =>
  pb.collection('task_comments').getFullList<TaskCommentRecord>({
    filter: `task_id = "${taskId}"`,
    sort: 'created',
    expand: 'user_id',
  })

export const createTaskComment = (taskId: string, content: string) => {
  const userId = pb.authStore.record?.id
  if (!userId) throw new Error('Not authenticated')
  return pb.collection('task_comments').create<TaskCommentRecord>({
    task_id: taskId,
    user_id: userId,
    content,
  })
}

export const deleteTaskComment = (id: string) => pb.collection('task_comments').delete(id)
