import { Link, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { BrainCircuit } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

type NavItem = { to: string; label: string }

function navActive(pathname: string, to: string) {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(`${to}/`)
}

export default function Navbar() {
  const loc = useLocation()
  const { token, logout, userType } = useAuth()

  const navItems = useMemo<NavItem[]>(() => {
    if (!token) {
      return [
        { to: '/', label: 'Home' },
        { to: '/login', label: 'Login' },
        { to: '/register', label: 'Register' },
      ]
    }
    if (userType === 'student') {
      return [
        { to: '/', label: 'Home' },
        { to: '/student/dashboard', label: 'Dashboard' },
        { to: '/student/learn', label: 'Learn' },
        { to: '/student/research-lab', label: 'Research Lab' },
        { to: '/student/experiments', label: 'Experiments' },
        { to: '/student/strategies', label: 'Strategies' },
      ]
    }
    if (userType === 'organization') {
      return [
        { to: '/', label: 'Home' },
        { to: '/organization/dashboard', label: 'Dashboard' },
        { to: '/organization/analytics', label: 'Analytics' },
        { to: '/organization/api-access', label: 'API' },
        { to: '/organization/bulk-backtest', label: 'Bulk' },
        { to: '/organization/team', label: 'Team' },
        { to: '/organization/export', label: 'Export' },
      ]
    }
    return [
      { to: '/', label: 'Home' },
      { to: '/individual/dashboard', label: 'Dashboard' },
      { to: '/individual/backtest', label: 'Backtest' },
      { to: '/individual/regime', label: 'Regime' },
      { to: '/individual/strategy', label: 'Strategies' },
      { to: '/individual/simulation', label: 'Simulation' },
      { to: '/individual/paper-trading', label: 'Paper Trading' },
    ]
  }, [token, userType])

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[#0A0A0F]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-2 px-4 py-3 md:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-glow">
            <BrainCircuit className="size-5" />
          </span>
          <span className="hidden font-semibold tracking-tight text-white sm:inline">QuantWise v3</span>
        </Link>

        <nav className="hidden flex-wrap items-center justify-end gap-0.5 lg:flex">
          {navItems.map((it) => {
            const active = navActive(loc.pathname, it.to)
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`relative whitespace-nowrap px-2 py-2 text-xs transition-colors md:px-2.5 md:text-sm ${
                  active ? 'text-white' : 'text-white/65 hover:text-white'
                }`}
              >
                {it.label}
                {active ? (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-violet-500 md:left-2.5 md:right-2.5" />
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {token ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-2 py-2 text-xs text-white/85 transition hover:bg-white/10 hover:text-white md:px-3 md:text-sm"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
