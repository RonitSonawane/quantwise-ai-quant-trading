import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 lg:block">
      <h3 className="mb-3 text-sm font-semibold text-white/80">Quick Links</h3>
      <ul className="space-y-2 text-sm">
        <li>
          <Link className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/10 hover:text-white" to="/individual/dashboard">
            Dashboard
          </Link>
        </li>
        <li>
          <Link className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/10 hover:text-white" to="/individual/backtest">
            Backtest
          </Link>
        </li>
        <li>
          <Link className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/10 hover:text-white" to="/individual/regime">
            Regime
          </Link>
        </li>
        <li>
          <Link className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/10 hover:text-white" to="/individual/simulation">
            Simulation
          </Link>
        </li>
        <li>
          <Link className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/10 hover:text-white" to="/individual/strategy">
            Strategy
          </Link>
        </li>
      </ul>
    </aside>
  )
}

