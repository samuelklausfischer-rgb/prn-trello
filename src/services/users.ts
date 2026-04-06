import pb from '@/lib/pocketbase/client'

export const getUsers = async () => {
  return await pb.collection('users').getFullList({
    sort: 'name',
  })
}

export const getEmployees = async () => {
  return await pb.collection('users').getFullList({
    filter: 'role != "admin" && is_active = true',
    sort: '-points,-xp,name',
  })
}

export const updateUser = async (id: string, data: any) => {
  return await pb.collection('users').update(id, data)
}
