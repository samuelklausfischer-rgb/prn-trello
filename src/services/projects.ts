import pb from '@/lib/pocketbase/client'

export interface ProjectRecord {
  id: string
  name: string
  description?: string
  progress: number
  status: 'active' | 'completed' | 'on_hold'
  color?: string
  created_by: string
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

export const updateProject = (id: string, data: Partial<ProjectRecord>) =>
  pb.collection('projects').update<ProjectRecord>(id, data)

export const deleteProject = (id: string) => pb.collection('projects').delete(id)
