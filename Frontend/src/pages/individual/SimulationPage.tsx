import { useMemo, useState } from 'react'
import { useSimulation } from '../../hooks/useSimulation'
import EquityCurveChart from '../../components/charts/EquityCurveChart'
import MetricCard from '../../components/dashboard/MetricCard'
import { formatCurrencyINR } from '../../utils/formatters'

import type { AssetId } from '../../types'

const strategyOptions = ['Combined_v3', 'ML_Signal', 'Regime_Aware_v3', 'Buy_Hold']

function toEquityChartPoints(series: any): Array<{ x: string; value: number }> {
  if (!Array.isArray(series)) return []
  return series.map((p: any) => ({ x: String(p.date).slice(5), value: Number(p.value) }))
}

export default function IndividualSimulationPage() {
  const mutation = useSimulation()

  const [asset, setAsset] = useState<AssetId>('nifty')
  const [strategy, setStrategy] = useState<string>('Combined_v3')
  const [initialCapital, setInitialCapital] = useState<number>(100000)
  const [limitPoints, setLimitPoints] = useState<number>(250)

  const [equityPoints, setEquityPoints] = useState<Array<{ x: string; value: number }>>([])
  const [result, setResult] = useState<any>(null)

  const equityValue = useMemo(() => {
    if (!result?.equity_curve?.length) return null
    const arr = result.equity_curve
    const last = arr[arr.length - 1]
    return last ? Number(last.value) : null
  }, [result])

  return (
    <div className="mx-auto max-w-7xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow">
        <h1 className="text-xl font-semibold text-white/90">Simulation</h1>
        <p className="mt-1 text-sm text-white/60">Project growth from initial capital for the selected strategy.</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-sm text-white/70">Select Index</span>
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white/90"
              value={asset}
              onChange={(e) => setAsset(e.target.value as AssetId)}
            >
              <option value="nifty">NIFTY 50</option>
              <option value="sp500">S&P 500</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-white/70">Strategy</span>
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white/90"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
            >
              {strategyOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-white/70">Initial Capital</span>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white/90"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              min={1000}
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/70">Points</span>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white/90"
              value={limitPoints}
              onChange={(e) => setLimitPoints(Number(e.target.value))}
              min={50}
              max={2000}
            />
          </label>
        </div>

        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => {
            setResult(null)
            setEquityPoints([])
            mutation.mutate(
              {
                asset,
                strategy,
                initial_capital: initialCapital,
                limit_points: limitPoints,
              },
              {
                onSuccess: (data) => {
                  const r = (data as any).result
                  setResult(r)
                  setEquityPoints(toEquityChartPoints(r?.equity_curve))
                },
              },
            )
          }}
          className="mt-5 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-95 disabled:opacity-70"
        >
          {mutation.isPending ? 'Running...' : 'Run Simulation'}
        </button>
      </div>

      {result ? (
        <div className="mt-5 space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="text-sm font-semibold text-white/60">Final Value</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {equityValue ? formatCurrencyINR(equityValue) : '—'}
                </div>
                <div className="mt-2 text-sm text-white/60">
                  {String(result.start_date ?? '')} → {String(result.end_date ?? '')}
                </div>
              </div>
              <div className={`text-sm font-semibold ${Number(result.profit_loss) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                Profit / Loss: {formatCurrencyINR(Number(result.profit_loss ?? 0))}
              </div>
            </div>

            <div className="mt-4">
              <EquityCurveChart data={equityPoints.length ? equityPoints : [{ x: 'N/A', value: initialCapital }]} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="CAGR%" value={String(result.cagr_pct ?? '—')} sub="(annualized, from simulator)" />
            <MetricCard label="Sharpe" value={String(result.sharpe_ratio ?? '—')} />
            <MetricCard label="Max DD" value={String(result.max_drawdown_pct ?? '—')} />
            <MetricCard label="Win Rate" value={String(result.win_rate_pct ?? '—')} />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Profit Factor" value={String(result.profit_factor ?? '—')} />
            <MetricCard label="Best Day" value={String(result.best_day_pct ?? '—')} />
            <MetricCard label="Worst Day" value={String(result.worst_day_pct ?? '—')} />
            <MetricCard label="Calmar" value={String(result.calmar_ratio ?? '—')} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

