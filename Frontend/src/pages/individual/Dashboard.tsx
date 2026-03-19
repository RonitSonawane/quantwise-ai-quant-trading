import { useMemo } from 'react'
import EquityCurveChart from '../../components/charts/EquityCurveChart'
import LiveIndexCard from '../../components/charts/LiveIndexCard'
import RegimeBadge from '../../components/dashboard/RegimeBadge'
import MetricCard from '../../components/dashboard/MetricCard'
import { useRegime } from '../../hooks/useRegime'

const mockEquity = Array.from({ length: 30 }).map((_, i) => {
  const x = i === 0 ? 'D-29' : `D-${29 - i}`
  const value = 100000 * (1 + (i / 29) * 0.15)
  return { x, value }
})

export default function IndividualDashboard() {
  const { data, isLoading } = useRegime()

  const regime = useMemo(() => {
    // Expected backend shape when calling GET /regime without `asset`
    const d = data as any
    const niftyReg = d?.nifty?.regime ?? 'Strong Bull'
    return {
      nifty: String(niftyReg),
      sp500: String(d?.sp500?.regime ?? 'Weak Sideways'),
    }
  }, [data])

  const live = useMemo(
    () => [
      { name: 'NIFTY 50', value: 24832, changePct: 0.43 },
      { name: 'SENSEX', value: 81765, changePct: 0.38 },
      { name: 'S&P 500', value: 5892, changePct: 0.21 },
    ],
    [],
  )

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-4 md:grid-cols-3">
        {live.map((l) => (
          <LiveIndexCard key={l.name} name={l.name} value={l.value} changePct={l.changePct} />
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow">
          <div className="text-sm font-semibold text-white/80">Current Regime</div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RegimeBadge regime={regime.nifty} />
            <div className="text-xs text-white/50">{isLoading ? 'Fetching…' : 'NIFTY 50'}</div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RegimeBadge regime={regime.sp500} />
            <div className="text-xs text-white/50">{isLoading ? 'Fetching…' : 'S&P 500'}</div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow">
          <div className="text-sm font-semibold text-white/80">Mini Equity Curve (Mock)</div>
          <div className="mt-3">
            <EquityCurveChart data={mockEquity} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <MetricCard label="Portfolio Value" value="Rs 1,15,000" sub="Initial Rs 1,00,000" />
        <MetricCard label="Total Return" value="+15.00%" sub="Last 30 days (mock)" />
        <MetricCard label="Sharpe Ratio" value="1.42" sub="Risk-adjusted (mock)" />
        <MetricCard label="Max Drawdown" value="-4.8%" sub="Worst dip (mock)" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow lg:col-span-2">
          <div className="text-sm font-semibold text-white/80">Recent Activity</div>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">
              Backtest run: <span className="font-semibold text-white/90">Combined_v3</span> • NIFTY 50
            </li>
            <li className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">
              Regime update detected: <span className="font-semibold text-white/90">{regime.nifty}</span>
            </li>
            <li className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">
              ML signal recomputed • Ensemble accuracy (mock): 66%
            </li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow">
          <div className="text-sm font-semibold text-white/80">Next Actions</div>
          <div className="mt-3 text-sm text-white/60">
            Use <span className="text-white/80">Backtest</span> to run the full pipeline, or <span className="text-white/80">Simulation</span> to
            project growth for a chosen strategy.
          </div>
        </div>
      </div>
    </div>
  )
}

