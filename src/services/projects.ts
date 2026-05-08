import pb from '@/lib/pocketbase/client'

export interface ProjectRecord {
  id: string
  name: string
  description?: string
  progress: number
  status: 'active' | 'completed' | 'on_hold' | 'todo' | 'in_progress' | 'review' | 'done'
  color?: string
  created_by: string
  shared_with_users?: string[]
  shared_with_roles?: string[]
  created: string
  updated: string
  expand?: {
    created_by?: { id: string; name: string; avatar: string }
  }
}

export const getProjects = () =>
  pb.collection('projects').getFullList<ProjectRecord>({ sort: '-created', expand: 'created_by' })

export const getProject = (id: string) =>
  pb.collection('projects').getOne<ProjectRecord>(id, { expand: 'created_by' })

export const createProject = (data: Partial<ProjectRecord>) =>
  pb.collection('projects').create<ProjectRecord>(data)

export const updateProject = (id: string, data: Partial<ProjectRecord>) => {
  const payload = { ...data } as Record<string, any>
  delete payload.id
  delete payload.created
  delete payload.updated
  delete payload.created_by
  delete payload.expand

  if ('shared_with_users' in data) {
    payload.shared_with_users = Array.isArray(data.shared_with_users) ? data.shared_with_users : []
  }
  if ('shared_with_roles' in data) {
    payload.shared_with_roles = Array.isArray(data.shared_with_roles) ? data.shared_with_roles : []
  }

  return pb.collection('projects').update<ProjectRecord>(id, payload)
}

export const deleteProject = (id: string) => pb.collection('projects').delete(id)
