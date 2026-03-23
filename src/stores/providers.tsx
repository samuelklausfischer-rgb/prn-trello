import React from 'react'
import { AuthProvider } from './useAuthStore'
import { TaskProvider } from './useTaskStore'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TaskProvider>{children}</TaskProvider>
    </AuthProvider>
  )
}
