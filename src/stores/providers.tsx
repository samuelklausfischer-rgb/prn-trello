import React from 'react'
import { AuthProvider } from './useAuthStore'
import { TaskProvider } from './useTaskStore'
import { AlertProvider } from './useAlertStore'
import { ThemeProvider } from '@/components/ThemeProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="prn-theme">
      <AuthProvider>
        <AlertProvider>
          <TaskProvider>{children}</TaskProvider>
        </AlertProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
