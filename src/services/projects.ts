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
  pb.collection('projects').create<ProjectRecord>(data, { expand: 'created_by' })

export const updateProject = (id: string, data: Partial<ProjectRecord>) => {
  const payload = { ...data } as Record<string, any>

  // Strip system-generated and uneditable fields to prevent 400 Bad Request
  delete payload.id
  delete payload.created
  delete payload.updated
  delete payload.created_by
  delete payload.expand
  delete payload.collectionId
  delete payload.collectionName

  // Strictly enforce arrays to satisfy PocketBase schema requirements for relations and JSON arrays
  if (data.shared_with_users !== undefined) {
    const users = Array.isArray(data.shared_with_users) ? data.shared_with_users : []
    // Ensure relation fields are sent as an array of IDs
    payload.shared_with_users = users
      .map((u) => (typeof u === 'object' && u !== null ? (u as any).id : u))
      .filter((u) => typeof u === 'string' && u.trim() !== '')
  }

  if (data.shared_with_roles !== undefined) {
    const roles = Array.isArray(data.shared_with_roles) ? data.shared_with_roles : []
    // Validate as a clean array of strings
    payload.shared_with_roles = roles.filter((r) => typeof r === 'string' && r.trim() !== '')
  }

  if (data.progress !== undefined) {
    payload.progress = Number(data.progress)
  }

  return pb.collection('projects').update<ProjectRecord>(id, payload, { expand: 'created_by' })
}

export const deleteProject = (id: string) => pb.collection('projects').delete(id)
