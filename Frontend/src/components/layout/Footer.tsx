import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[rgba(255,255,255,0.08)] py-8 text-sm text-white/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="font-semibold text-white/80">QuantWise v3</div>
            <p className="mt-2 max-w-md text-white/55">AI-powered regime detection, ML ensemble signals, and research-grade backtests.</p>
          </div>
          <div className="flex flex-wrap gap-8">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/40">Product</div>
              <Link className="block hover:text-white" to="/individual/backtest">
                Backtest
              </Link>
              <Link className="block hover:text-white" to="/individual/regime">
                Regime
              </Link>
              <Link className="block hover:text-white" to="/individual/strategy">
                Strategy comparison
              </Link>
              <Link className="block hover:text-white" to="/individual/simulation">
                Simulation
              </Link>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/40">Account</div>
              <Link className="block hover:text-white" to="/login">
                Login
              </Link>
              <Link className="block hover:text-white" to="/register">
                Register
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-[rgba(255,255,255,0.06)] pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} QuantWise. Academic / research use.
        </div>
      </div>
    </footer>
  )
}
