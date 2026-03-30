import pb from '@/lib/pocketbase/client'

export const getTaskHistory = async () => {
  return await pb.collection('task_history').getFullList({
    sort: '-created',
    expand: 'performed_by,task_id',
    limit: 100,
  })
}
