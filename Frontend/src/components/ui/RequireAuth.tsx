import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth, type UserType } from '../../context/AuthContext'

export default function RequireAuth({
  userType,
  children,
}: {
  userType: UserType
  children: ReactNode
}) {
  const { token, userType: storedUserType } = useAuth()

  if (!token) return <Navigate to="/login" replace />
  if (!storedUserType || storedUserType !== userType) {
    return <Navigate to={storedUserType ? `/${storedUserType}/dashboard` : '/login'} replace />
  }
  return <>{children}</>
}

