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
  tutorial_progress?: Record<string, boolean>
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
    tutorial_progress: {},
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
    tutorial_progress: {},
  },
]

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  logout: () => void
  addPoints: (points: number, reason?: string, sourceType?: string) => void
  updateTutorialProgress: (tourId: string, completed: boolean) => Promise<void>
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
    tutorial_progress: record.tutorial_progress || {},
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(
    pb.authStore.isValid ? mapRecordToUser(pb.authStore.record) : null,
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      if (!pb.authStore.isValid && pb.authStore.token) {
        pb.authStore.clear()
        setUser(null)
      } else if (pb.authStore.isValid) {
        try {
          const authData = await pb.collection('users').authRefresh()
          setUser(mapRecordToUser(authData.record))
        } catch (err) {
          pb.authStore.clear()
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()

    const unsubscribe = pb.authStore.onChange((token, record) => {
      setUser(pb.authStore.isValid ? mapRecordToUser(record) : null)
    })

    const handleAuthError = () => {
      setUser(null)
      pb.authStore.clear()
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

  const updateTutorialProgress = async (tourId: string, completed: boolean) => {
    if (!user) return
    const newProgress = { ...(user.tutorial_progress || {}), [tourId]: completed }
    setUser({ ...user, tutorial_progress: newProgress })
    try {
      await pb.collection('users').update(user.id, { tutorial_progress: newProgress })
    } catch (e) {
      console.error('Failed to update tutorial progress:', e)
    }
  }

  return React.createElement(
    AuthContext.Provider,
    { value: { user, isLoading, login, logout, addPoints, updateTutorialProgress } },
    children,
  )
}

export default function useAuthStore() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthStore must be used within AuthProvider')
  return context
}
