import { useMemo } from 'react'
import { KeyRound, Users, BarChart3 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function OrganizationDashboard() {
  const { email } = useAuth()

  const orgCards = useMemo(
    () => [
      { title: 'API Access', icon: KeyRound, desc: 'Create and manage API keys for organization usage.', accent: 'from-purple-600 to-blue-600' },
      { title: 'Team Analytics', icon: Users, desc: 'Monitor team performance, runs, and research outcomes.', accent: 'from-emerald-600 to-teal-500' },
      { title: 'Bulk Tools', icon: BarChart3, desc: 'Run bulk backtests and compare strategy winners by index.', accent: 'from-purple-600 to-emerald-600' },
    ],
    [],
  )

  return (
    <div className="mx-auto max-w-7xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow">
        <h1 className="text-xl font-semibold text-white/90">Organization Dashboard</h1>
        <p className="mt-1 text-sm text-white/60">Advanced analytics and API access (mock UI).</p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {orgCards.map((c) => {
            const Icon = c.icon
            return (
              <div key={c.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-br ${c.accent} p-2`}>
                  <Icon className="size-5 text-white" />
                </div>
                <div className="mt-3 text-sm font-semibold text-white/85">{c.title}</div>
                <div className="mt-1 text-sm text-white/60">{c.desc}</div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm font-semibold text-white/80">Organization Account</div>
          <div className="mt-2 text-sm text-white/60">
            Logged in as <span className="text-white/90 font-semibold">{email ?? '—'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

