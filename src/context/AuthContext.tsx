import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { clearToken, fetchAuthMeWithRetry, getToken, loginPi360 } from '../api/client'
import type { AuthMeData } from '../api/types'
import { isAllowedLoginEmail } from '../lib/allowedEmails'

interface AuthContextValue {
  user: AuthMeData | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthMeData>
  logout: () => void
  refresh: () => Promise<AuthMeData | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthMeData | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      return null
    }
    try {
      const data = await fetchAuthMeWithRetry(2)
      setUser(data)
      return data
    } catch {
      clearToken()
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const normalized = email.trim()
    if (!isAllowedLoginEmail(normalized)) {
      throw new Error('Access is restricted to authorized accounts only.')
    }
    await loginPi360(normalized, password)
    const data = await fetchAuthMeWithRetry()
    if (!isAllowedLoginEmail(data.email || normalized)) {
      clearToken()
      setUser(null)
      throw new Error('Access is restricted to authorized accounts only.')
    }
    setUser(data)
    return data
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
