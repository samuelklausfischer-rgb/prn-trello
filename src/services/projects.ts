import pb from '@/lib/pocketbase/client'

export interface ProjectRecord {
  id: string
  name: string
  description?: string
  color?: string
  created: string
  updated: string
}

export const getProjects = () =>
  pb.collection('projects').getFullList<ProjectRecord>({ sort: '-created' })

export const getProject = (id: string) => pb.collection('projects').getOne<ProjectRecord>(id)

export const createProject = (data: Partial<ProjectRecord>) =>
  pb.collection('projects').create<ProjectRecord>(data)

export const updateProject = (id: string, data: Partial<ProjectRecord>) =>
  pb.collection('projects').update<ProjectRecord>(id, data)

export const deleteProject = (id: string) => pb.collection('projects').delete(id)
