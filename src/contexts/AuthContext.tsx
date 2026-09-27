import React, { createContext, useContext, useState } from 'react'
import type { User } from '@/types'
import type { Database } from '@/types/database'

type ProfilesTable = Database['public']['Tables']['profiles']

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: ProfilesTable['Update']) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Demo mode: Provide a mock admin user without authentication
  const [user] = useState<User>({
    id: 'demo-user-id',
    email: 'demo@crickstats.com',
    full_name: 'Demo User',
    role: 'ADMIN',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  const [loading] = useState(false)

  // Demo mode: No-op authentication functions
  const signIn = async (_email: string, _password: string) => {
    return { error: null }
  }

  const signUp = async (_email: string, _password: string, _fullName: string) => {
    return { error: null }
  }

  const signOut = async () => {
    // No-op in demo mode
  }

  const updateProfile = async (_updates: ProfilesTable['Update']) => {
    return { error: null }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
