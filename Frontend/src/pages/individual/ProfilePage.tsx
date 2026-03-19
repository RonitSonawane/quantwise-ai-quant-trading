import { useMemo, useState } from 'react'
import { useAuth, type UserType } from '../../context/AuthContext'
import MetricCard from '../../components/dashboard/MetricCard'

function planFor(type: UserType) {
  if (type === 'organization') return { name: 'Organization', price: '₹2,999/mo', note: 'API keys + team features' }
  if (type === 'student') return { name: 'Student', price: '₹499/mo', note: 'Learning + experiments' }
  return { name: 'Individual', price: 'Free', note: 'Backtest + simulation' }
}

export default function IndividualProfilePage() {
  const { email, userType, logout } = useAuth()
  const [displayName, setDisplayName] = useState<string>('Quantwise User')

  const plan = useMemo(() => planFor((userType ?? 'individual') as UserType), [userType])

  return (
    <div className="mx-auto max-w-7xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow">
        <h1 className="text-xl font-semibold text-white/90">Profile</h1>
        <p className="mt-1 text-sm text-white/60">Manage your account and access keys.</p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 lg:col-span-2">
            <div className="text-sm font-semibold text-white/80">User Info</div>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs text-white/50">Email</div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90">{email ?? '—'}</div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-white/50">User Type</div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90">{userType ?? 'individual'}</div>
              </div>

              <label className="block md:col-span-2">
                <div className="text-xs text-white/50">Display Name</div>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/90"
                />
              </label>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                Logout
              </button>
              <button
                type="button"
                className="rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-95"
              >
                Save (Mock)
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold text-white/80">Subscription</div>
            <div className="mt-3 text-2xl font-semibold text-white/90">{plan.price}</div>
            <div className="mt-1 text-sm text-white/60">{plan.note}</div>

            {userType === 'organization' ? (
              <div className="mt-5 space-y-2">
                <div className="text-sm font-semibold text-white/80">API Key</div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-mono text-white/80">
                  org.demo.quantwise-api-key
                </div>
                <button
                  type="button"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                >
                  Regenerate (Mock)
                </button>
              </div>
            ) : (
              <div className="mt-5 text-sm text-white/60">API keys available for Organization users.</div>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <MetricCard label="Projects" value="2" sub="Research experiments (mock)" />
          <MetricCard label="Backtests" value="14" sub="Total runs (mock)" />
          <MetricCard label="Success Rate" value="82%" sub="Performance tracking (mock)" />
        </div>
      </div>
    </div>
  )
}

