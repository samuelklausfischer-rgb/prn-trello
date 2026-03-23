import React from 'react'
import { AuthProvider } from './useAuthStore'
import { TaskProvider } from './useTaskStore'
import { ThemeProvider } from '@/components/ThemeProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="prn-theme">
      <AuthProvider>
        <TaskProvider>{children}</TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
