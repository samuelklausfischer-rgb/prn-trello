import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuthHooks'
import { Role } from '@/stores/useAuthStore'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

/**
 * A component to wrap pages that require authentication and specific role verification.
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    // Redirect them to the login page, but save the current location they were trying to go to
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to home page or an unauthorized page
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
