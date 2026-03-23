import { Role } from '@/stores/useAuthStore'

export enum Permission {
  VIEW_ALL_TASKS = 'VIEW_ALL_TASKS',
  VIEW_OTHERS_TASKS = 'VIEW_OTHERS_TASKS',
  CREATE_TASK_FOR_OTHERS = 'CREATE_TASK_FOR_OTHERS',
  EDIT_OTHERS_TASKS = 'EDIT_OTHERS_TASKS',
  DELEGATE_TASKS = 'DELEGATE_TASKS',
  MANAGE_ALL_CHECKLISTS = 'MANAGE_ALL_CHECKLISTS',
  CREATE_ALERTS = 'CREATE_ALERTS',
  VIEW_ALL_SCORES = 'VIEW_ALL_SCORES',
  VIEW_FULL_DASHBOARD = 'VIEW_FULL_DASHBOARD',
}

export type RolePermission = {
  id: string
  role: Role
  permission: Permission
  allowed: boolean
}

export class Permissions {
  static canViewOthersTasks(role?: Role) {
    return role === 'ADMIN'
  }
  static canCreateTaskForOthers(role?: Role) {
    return role === 'ADMIN'
  }
  static canEditOthersTasks(role?: Role) {
    return role === 'ADMIN'
  }
  static canDelegateTasks(role?: Role) {
    return role === 'ADMIN'
  }
  static canManageOthersChecklists(role?: Role) {
    return role === 'ADMIN'
  }
  static canCreateAlerts(role?: Role) {
    return role === 'ADMIN'
  }
  static canViewAllScores(role?: Role) {
    return role === 'ADMIN'
  }
  static canViewFullDashboard(role?: Role) {
    return role === 'ADMIN'
  }
}
