/* eslint-disable react-refresh/only-export-components -- provider + hook */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export type UserType = 'individual' | 'student' | 'organization'

type AuthContextValue = {
  token: string | null
  userType: UserType | null
  email: string | null
  login: (args: { email: string; password: string; userType: UserType }) => void
  register: (args: { email: string; password: string; userType: UserType }) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'quantwise_jwt'
const USER_TYPE_KEY = 'quantwise_user_type'
const EMAIL_KEY = 'quantwise_email'

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [userType, setUserType] = useState<UserType | null>(
    () => (localStorage.getItem(USER_TYPE_KEY) as UserType | null) ?? null,
  )
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem(EMAIL_KEY))

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      userType,
      email,
      login: ({ email: em, userType: ut }) => {
        // Mock JWT for UI flow. Replace with real backend auth later.
        const fakeToken = `mock.${btoa(`${em}:${ut}`)}.token`
        localStorage.setItem(TOKEN_KEY, fakeToken)
        localStorage.setItem(USER_TYPE_KEY, ut)
        localStorage.setItem(EMAIL_KEY, em)
        setToken(fakeToken)
        setUserType(ut)
        setEmail(em)
        navigate(`/${ut}/dashboard`, { replace: true })
      },
      register: ({ email: em, userType: ut }) => {
        const fakeToken = `mock.${btoa(`${em}:${ut}`)}.token`
        localStorage.setItem(TOKEN_KEY, fakeToken)
        localStorage.setItem(USER_TYPE_KEY, ut)
        localStorage.setItem(EMAIL_KEY, em)
        setToken(fakeToken)
        setUserType(ut)
        setEmail(em)
        navigate(`/${ut}/dashboard`, { replace: true })
      },
      logout: () => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_TYPE_KEY)
        localStorage.removeItem(EMAIL_KEY)
        setToken(null)
        setUserType(null)
        setEmail(null)
        navigate('/login', { replace: true })
      },
    }),
    [email, navigate, token, userType],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

