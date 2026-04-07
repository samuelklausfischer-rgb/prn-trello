import React, { createContext, useContext, useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'

export type Role = 'ADMIN' | 'EMPLOYEE'

export type User = {
  id: string
  email: string
  name: string
  role: Role
  avatar?: string
  points: number
  level: number
  xp?: number
  streak_days?: number
  bio?: string
  phone?: string
  department?: string
  job_title?: string
}

export const SYSTEM_USERS: User[] = [
  {
    id: 'admin-1',
    email: 'paulonovack@gmail.com',
    name: 'Paulo Novack',
    role: 'ADMIN',
    points: 0,
    level: 1,
    streak_days: 0,
    xp: 0,
  },
  {
    id: 'emp-1',
    email: 'joao@prn.com',
    name: 'João Silva',
    role: 'EMPLOYEE',
    points: 420,
    level: 1,
    streak_days: 3,
    xp: 100,
  },
]

type AuthContextType = {
  user: User | null
  login: (user: User) => void
  logout: () => void
  addPoints: (points: number, reason?: string, sourceType?: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const mapRecordToUser = (record: any): User | null => {
  if (!record) return null
  return {
    id: record.id,
    email: record.email,
    name: record.name || record.email.split('@')[0],
    role: (record.role?.toUpperCase() || 'EMPLOYEE') as Role,
    avatar: record.avatar ? pb.files.getURL(record, record.avatar) : undefined,
    points: record.points || 0,
    level: record.level || 1,
    xp: record.xp || 0,
    streak_days: record.streak_days || 0,
    bio: record.bio || '',
    phone: record.phone || '',
    department: record.department || '',
    job_title: record.job_title || '',
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(
    pb.authStore.isValid ? mapRecordToUser(pb.authStore.record) : null,
  )

  useEffect(() => {
    // If we have a token but it's invalid, clear it immediately
    if (!pb.authStore.isValid && pb.authStore.token) {
      pb.authStore.clear()
    } else if (pb.authStore.isValid) {
      // Refresh the token to keep session alive and sync with server
      pb.collection('users')
        .authRefresh()
        .catch(() => {
          pb.authStore.clear()
        })
    }

    const unsubscribe = pb.authStore.onChange((token, record) => {
      setUser(pb.authStore.isValid ? mapRecordToUser(record) : null)
    })

    // Listen for custom auth errors from the client
    const handleAuthError = () => {
      setUser(null)
    }
    window.addEventListener('pb:auth-error', handleAuthError)

    return () => {
      unsubscribe()
      window.removeEventListener('pb:auth-error', handleAuthError)
    }
  }, [])

  const login = (userData: User) => {
    // Handled by pb.authStore.onChange listener when auth is performed
  }

  const logout = () => {
    pb.authStore.clear()
  }

  const addPoints = async (
    points: number,
    reason: string = 'Ajuste manual',
    sourceType: string = 'system',
  ) => {
    if (!user) return
    const newPoints = user.points + points
    const newXp = (user.xp || 0) + points

    try {
      await pb.collection('users').update(
        user.id,
        {
          points: newPoints,
          xp: newXp,
        },
        {
          headers: {
            'x-point-reason': encodeURIComponent(reason),
            'x-source-type': sourceType,
          },
        },
      )
    } catch (e) {
      console.error('Failed to update points:', e)
    }
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
