import { Link, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Download,
  KeyRound,
  LayoutDashboard,
  ShieldAlert,
  Upload,
  Users,
} from 'lucide-react'

const items = [
  { to: '/organization/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/organization/analytics', label: 'Analytics', Icon: BarChart3 },
  { to: '/organization/api-access', label: 'API Access', Icon: KeyRound },
  { to: '/organization/bulk-backtest', label: 'Bulk Backtest', Icon: Upload },
  { to: '/organization/risk-report', label: 'Risk Report', Icon: ShieldAlert },
  { to: '/organization/team', label: 'Team', Icon: Users },
  { to: '/organization/export', label: 'Export', Icon: Download },
]

function active(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

export default function OrganizationSidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/[0.08] bg-[#0D0D14] md:block">
      <nav className="sticky top-20 space-y-1 p-4">
        {items.map(({ to, label, Icon }) => {
          const on = active(pathname, to)
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                on
                  ? 'border-l-2 border-violet-500 bg-violet-600/20 pl-[10px] text-violet-300'
                  : 'border-l-2 border-transparent text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="size-5 shrink-0 opacity-90" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
