import React, { createContext, useContext, useState, useEffect } from 'react'
import { AuthUser } from '../types'
import { authApi } from '../lib/api'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { username: string; email: string; password: string; branch?: string; gradYear?: number }) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  isAuthModalOpen: boolean
  authModalTab: 'login' | 'register'
  openAuthModal: (tab?: 'login' | 'register') => void
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login')

  const refresh = async () => {
    try {
      const data = await authApi.getMe()
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    setUser(data.user)
    setIsAuthModalOpen(false)
  }

  const register = async (regData: { username: string; email: string; password: string; branch?: string; gradYear?: number }) => {
    const data = await authApi.register(regData)
    setUser(data.user)
    setIsAuthModalOpen(false)
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
  }

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab)
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refresh,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
