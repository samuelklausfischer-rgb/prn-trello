import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore, { Role } from '@/stores/useAuthStore'

/**
 * Returns current session data and authentication status.
 */
export function useAuth() {
  const { user, login, logout, addPoints } = useAuthStore()
  return {
    user,
    isAuthenticated: !!user,
    role: user?.role,
    login,
    logout,
    addPoints,
  }
}

/**
 * Automatically redirects the user to the login page if they are not authenticated.
 */
export function useRequireAuth() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return user
}

/**
 * Automatically redirects the user if they do not possess the required permission level.
 */
export function useRequireRole(allowedRoles: Role | Role[]) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) return

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

    if (!rolesArray.includes(user.role)) {
      navigate('/', { replace: true })
    }
  }, [user, isAuthenticated, allowedRoles, navigate])

  return user
}
