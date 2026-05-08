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
    created_by?: { id: string; name: string; avatar: string; email?: string }
  }
}

export const getProjects = () =>
  pb.collection('projects').getFullList<ProjectRecord>({ sort: '-created', expand: 'created_by' })

export const getProject = (id: string) =>
  pb.collection('projects').getOne<ProjectRecord>(id, { expand: 'created_by' })

export const createProject = (data: Partial<ProjectRecord>) => {
  const payload = sanitizeProjectPayload(data, true)
  return pb.collection('projects').create<ProjectRecord>(payload)
}

export const updateProject = (id: string, data: Partial<ProjectRecord>) => {
  const payload = sanitizeProjectPayload(data, false)
  // Explicitly strip read-only and system fields to meet requirements
  delete payload.id
  delete payload.created
  delete payload.updated
  delete payload.collectionId
  delete payload.collectionName
  delete payload.expand

  return pb.collection('projects').update<ProjectRecord>(id, payload)
}

function sanitizeProjectPayload(data: Partial<ProjectRecord>, isCreate: boolean) {
  const allowedFields = [
    'name',
    'description',
    'progress',
    'status',
    'color',
    'shared_with_users',
    'shared_with_roles',
  ]
  if (isCreate) allowedFields.push('created_by')

  const payload: Record<string, any> = {}

  for (const field of allowedFields) {
    if (data[field as keyof ProjectRecord] !== undefined) {
      payload[field] = data[field as keyof ProjectRecord]
    }
  }

  // Ensure relationship arrays are strictly arrays of strings (IDs), never null or undefined
  if ('shared_with_users' in data) {
    const rawUsers = data.shared_with_users
    const usersArray = Array.isArray(rawUsers) ? rawUsers : rawUsers != null ? [rawUsers] : []
    payload.shared_with_users = usersArray
      .map((u) => (typeof u === 'object' && u !== null ? (u as any).id : String(u)))
      .filter((u) => typeof u === 'string' && u.trim() !== '')
  }

  if ('shared_with_roles' in data) {
    const rawRoles = data.shared_with_roles
    const rolesArray = Array.isArray(rawRoles) ? rawRoles : rawRoles != null ? [rawRoles] : []
    payload.shared_with_roles = rolesArray
      .map((r) => String(r))
      .filter((r) => typeof r === 'string' && r.trim() !== '')
  }

  if ('progress' in payload) {
    payload.progress = Number(payload.progress)
  }

  if ('status' in payload) {
    const validStatuses = [
      'active',
      'completed',
      'on_hold',
      'todo',
      'in_progress',
      'review',
      'done',
    ]
    const s = Array.isArray(payload.status) ? payload.status[0] : payload.status
    if (validStatuses.includes(s)) {
      payload.status = s
    }
  }

  return payload
}

export const deleteProject = (id: string) => pb.collection('projects').delete(id)
