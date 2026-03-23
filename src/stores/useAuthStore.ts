import React, { createContext, useContext, useState } from 'react'

export type Role = 'ADMIN' | 'EMPLOYEE'

export type User = {
  id: string
  email: string
  name: string
  role: Role
  avatar?: string
  points: number
  level: number
  password?: string
}

type AuthContextType = {
  user: User | null
  login: (user: User) => void
  logout: () => void
  addPoints: (points: number) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

// Initialize with null to force login screen by default, as per requirements
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (userData: User) => {
    // Remove password from state for security
    const { password, ...safeUser } = userData
    setUser(safeUser)
  }

  const logout = () => setUser(null)

  const addPoints = (points: number) => {
    setUser((prev) => {
      if (!prev) return prev
      const newPoints = prev.points + points
      const newLevel = Math.floor(newPoints / 500) + 1
      return { ...prev, points: newPoints, level: newLevel }
    })
  }

  return React.createElement(
    AuthContext.Provider,
    { value: { user, login, logout, addPoints } },
    children,
  )
}

export default function useAuthStore() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthStore must be used within AuthProvider')
  return context
}
