import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore, { Role } from '@/stores/useAuthStore'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

/**
 * A component to wrap pages that require authentication and specific role verification.
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isAuthenticated = !!user

  if (!isAuthenticated) {
    // Redirect them to the login page, but save the current location they were trying to go to
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to home page or an unauthorized page
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
