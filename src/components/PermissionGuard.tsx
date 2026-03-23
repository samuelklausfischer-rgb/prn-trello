import React from 'react'
import { useAuth } from '@/hooks/useAuthHooks'
import { Role } from '@/stores/useAuthStore'

interface PermissionGuardProps {
  allowedRoles?: Role[]
  check?: (role?: Role) => boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function PermissionGuard({
  allowedRoles,
  check,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { role } = useAuth()

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <>{fallback}</>
  }

  if (check && !check(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
