import { Link, useLocation } from 'react-router-dom'
import { BrainCircuit } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/individual/dashboard', label: 'Dashboard' },
  { to: '/individual/backtest', label: 'Backtest' },
  { to: '/individual/regime', label: 'Regime' },
]

export default function Navbar() {
  const loc = useLocation()
  const { token, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-glow">
            <BrainCircuit className="size-5" />
          </span>
          <span className="font-semibold tracking-tight">QuantWise v3</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navItems.map((it) => {
            const active = loc.pathname === it.to || loc.pathname.startsWith(it.to + '/')
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`text-sm transition-colors ${
                  active ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                {it.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          {token ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 px-3 py-2 text-sm text-white shadow-glow"
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

