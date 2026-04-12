import { Link, useLocation } from 'react-router-dom'
import { BrainCircuit } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/individual/dashboard', label: 'Dashboard' },
  { to: '/individual/backtest', label: 'Backtest' },
  { to: '/individual/regime', label: 'Regime' },
  { to: '/individual/strategy', label: 'Strategies' },
  { to: '/individual/simulation', label: 'Simulation' },
]

function navActive(pathname: string, to: string) {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(`${to}/`)
}

export default function Navbar() {
  const loc = useLocation()
  const { token, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[#0A0A0F]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-glow">
            <BrainCircuit className="size-5" />
          </span>
          <span className="font-semibold tracking-tight text-white">QuantWise v3</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((it) => {
            const active = navActive(loc.pathname, it.to)
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`relative px-3 py-2 text-sm transition-colors ${
                  active ? 'text-white' : 'text-white/65 hover:text-white'
                }`}
              >
                {it.label}
                {active ? (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-violet-500" />
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          {token ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white transition hover:bg-violet-500"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
