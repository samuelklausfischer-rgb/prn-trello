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

export const SYSTEM_USERS: User[] = [
  {
    id: 'u1',
    email: 'admin@prn.com',
    password: 'admin123',
    name: 'Admin Geral',
    role: 'ADMIN',
    points: 1250,
    level: 3,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
  },
  {
    id: 'u2',
    email: 'joao@prn.com',
    password: 'func123',
    name: 'João Silva',
    role: 'EMPLOYEE',
    points: 420,
    level: 1,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
  },
  {
    id: 'u3',
    email: 'maria@prn.com',
    password: 'func123',
    name: 'Maria Oliveira',
    role: 'EMPLOYEE',
    points: 980,
    level: 2,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=3',
  },
  {
    id: 'u4',
    email: 'pedro@prn.com',
    password: 'func123',
    name: 'Pedro Souza',
    role: 'EMPLOYEE',
    points: 650,
    level: 2,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4',
  },
  {
    id: 'u5',
    email: 'ana@prn.com',
    password: 'func123',
    name: 'Ana Costa',
    role: 'EMPLOYEE',
    points: 210,
    level: 1,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=5',
  },
]

type AuthContextType = {
  user: User | null
  login: (user: User) => void
  logout: () => void
  addPoints: (points: number) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (userData: User) => {
    const { password, ...safeUser } = userData
    setUser(safeUser as User)
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
