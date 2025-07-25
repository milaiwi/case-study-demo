'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type UserRole = 'client' | 'employee'

interface AuthContextType {
  isAuthenticated: boolean
  userRole: UserRole
  login: (email: string, password: string) => boolean
  logout: () => void
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>('client')

  // Check localStorage on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated')
    const savedRole = localStorage.getItem('userRole') as UserRole
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
    if (savedRole) {
      setUserRole(savedRole)
    }
  }, [])

  const login = (email: string, password: string): boolean => {
    // Demo credentials
    if (email === 'example@gmail.com' && password === 'example123') {
      setIsAuthenticated(true)
      localStorage.setItem('isAuthenticated', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserRole('client')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userRole')
  }

  const switchRole = (role: UserRole) => {
    setUserRole(role)
    localStorage.setItem('userRole', role)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
} 