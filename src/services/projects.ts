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
  const payload: Partial<ProjectRecord> = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.description !== undefined) payload.description = data.description
  if (data.progress !== undefined) payload.progress = data.progress
  if (data.status !== undefined) payload.status = data.status
  if (data.color !== undefined) payload.color = data.color
  if (data.shared_with_users !== undefined) payload.shared_with_users = data.shared_with_users
  if (data.shared_with_roles !== undefined) payload.shared_with_roles = data.shared_with_roles

  return pb.collection('projects').update<ProjectRecord>(id, payload)
}

export const deleteProject = (id: string) => pb.collection('projects').delete(id)
