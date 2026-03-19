import MetricCard from './MetricCard'

export default function SimulationResult({
  finalValue,
  profitLoss,
  metrics,
}: {
  finalValue: string
  profitLoss: string
  metrics: {
    cagr?: string
    sharpe?: string
    maxDrawdown?: string
    winRate?: string
  }
}) {
  const positive = !profitLoss.startsWith('-')
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white/60">Final Value</div>
          <div className="mt-2 text-3xl font-semibold text-white/90">{finalValue}</div>
        </div>
        <div className={`text-sm font-semibold ${positive ? 'text-emerald-300' : 'text-red-300'}`}>P/L: {profitLoss}</div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <MetricCard label="CAGR%" value={metrics.cagr ?? '—'} />
        <MetricCard label="Sharpe" value={metrics.sharpe ?? '—'} />
        <MetricCard label="Max Drawdown" value={metrics.maxDrawdown ?? '—'} />
        <MetricCard label="Win Rate" value={metrics.winRate ?? '—'} />
      </div>
    </div>
  )
}

