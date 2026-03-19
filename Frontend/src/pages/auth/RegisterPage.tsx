import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth, type UserType } from '../../context/AuthContext'

const userTypes: Array<{ value: UserType; label: string }> = [
  { value: 'individual', label: 'Individual Investor' },
  { value: 'student', label: 'Student & Researcher' },
  { value: 'organization', label: 'Organization' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register, token } = useAuth()

  const initialType = useMemo<UserType>(() => {
    const sp = new URLSearchParams(location.search)
    const q = sp.get('type') as UserType | null
    if (q && ['individual', 'student', 'organization'].includes(q)) return q
    const stored = localStorage.getItem('quantwise_user_type') as UserType | null
    if (stored && ['individual', 'student', 'organization'].includes(stored)) return stored
    return 'individual'
  }, [location.search])

  const [userType, setUserType] = useState<UserType>(initialType)
  const [email, setEmail] = useState('researcher@quantwise.ai')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setUserType(initialType)
  }, [initialType])

  useEffect(() => {
    if (token) navigate(`/${userType}/dashboard`)
  }, [navigate, token, userType])

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow">
        <h1 className="text-2xl font-semibold">Register</h1>
        <p className="mt-2 text-sm text-white/60">Pick your role and start using QuantWise v3.</p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm text-white/70">User Type</span>
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white/90"
              value={userType}
              onChange={(e) => setUserType(e.target.value as UserType)}
            >
              {userTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-white/70">Email</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white/90"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/70">Password</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white/90"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </label>

          {error ? <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

          <button
            type="button"
            onClick={() => {
              setError(null)
              if (!email.trim() || !password.trim()) {
                setError('Please enter email and password.')
                return
              }
              register({ email, password, userType })
            }}
            className="w-full rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
          >
            Create account
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  )
}

