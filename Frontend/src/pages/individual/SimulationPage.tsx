import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSimulation } from '../../hooks/useSimulation'
import EquityCurveChart from '../../components/charts/EquityCurveChart'
import { formatCurrencyINR } from '../../utils/formatters'

import type { AssetId } from '../../types'

const strategyOptions = ['Combined_v3', 'ML_Signal', 'Regime_Aware_v3', 'Buy_Hold']

const inputCls =
  'mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-zinc-950 px-3 py-2.5 text-sm text-white shadow-inner [color-scheme:dark] outline-none focus:border-violet-500/60'

function toEquityChartPoints(series: unknown): Array<{ date: string; value: number }> {
  if (!Array.isArray(series)) return []
  return series.map((p: { date?: string; value?: number }) => ({
    date: String(p.date ?? '').slice(0, 10),
    value: Number(p.value ?? 0),
  }))
}

function AnimatedRupee({ from, to }: { from: number; to: number }) {
  const [v, setV] = useState(from)

  useEffect(() => {
    const start = performance.now()
    const dur = 2400
    let raf = 0
    function tick(now: number) {
      const p = Math.min(1, (now - start) / dur)
      const ease = 1 - (1 - p) ** 3
      setV(from + (to - from) * ease)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [from, to])

  return <span className="tabular-nums">{formatCurrencyINR(Math.round(v))}</span>
}

export default function IndividualSimulationPage() {
  const mutation = useSimulation()

  const [asset, setAsset] = useState<AssetId>('nifty')
  const [strategy, setStrategy] = useState<string>('Combined_v3')
  const [initialCapital, setInitialCapital] = useState<number>(100000)
  const [limitPoints, setLimitPoints] = useState<number>(400)
  const [startDate, setStartDate] = useState('2000-01-01')
  const [endDate, setEndDate] = useState('2026-01-01')

  const [equityPoints, setEquityPoints] = useState<Array<{ date: string; value: number }>>([])
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  const finalValue = useMemo(() => {
    if (!result?.equity_curve || !Array.isArray(result.equity_curve)) return null
    const arr = result.equity_curve as Array<{ value?: number }>
    const last = arr[arr.length - 1]
    return last ? Number(last.value) : null
  }, [result])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-white">Simulation</h1>

      <div className="mx-auto w-full max-w-3xl rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-glow">
        <p className="text-center text-sm text-white/60">
          Project growth from your starting capital using stored strategy returns from the ML service.
        </p>

        <div className="mx-auto mt-6 grid max-w-xl gap-5">
          <label className="block text-left">
            <span className="text-sm font-medium text-white/75">Index</span>
            <select className={inputCls} value={asset} onChange={(e) => setAsset(e.target.value as AssetId)}>
              <option value="nifty">NIFTY 50</option>
              <option value="sp500">S&amp;P 500</option>
            </select>
          </label>

          <label className="block text-left">
            <span className="text-sm font-medium text-white/75">Strategy</span>
            <select className={inputCls} value={strategy} onChange={(e) => setStrategy(e.target.value)}>
              {strategyOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-left">
            <span className="text-sm font-medium text-white/75">Starting capital (Rs)</span>
            <input
              type="number"
              className={inputCls}
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              min={1000}
            />
          </label>

          <label className="block text-left">
            <span className="text-sm font-medium text-white/75">Curve points (detail)</span>
            <input
              type="number"
              className={inputCls}
              value={limitPoints}
              onChange={(e) => setLimitPoints(Number(e.target.value))}
              min={50}
              max={2000}
            />
          </label>

          <label className="block text-left">
            <span className="text-sm font-medium text-white/75">Start date</span>
            <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>

          <label className="block text-left">
            <span className="text-sm font-medium text-white/75">End date</span>
            <input type="date" className={inputCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>

          <p className="text-xs text-white/45">
            Simulation runs over the selected date range.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
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
                  start_date: startDate,
                  end_date: endDate,
                },
                {
                  onSuccess: (data) => {
                    const r = (data as { result?: Record<string, unknown> }).result
                    if (r) {
                      setResult(r)
                      setEquityPoints(toEquityChartPoints(r.equity_curve))
                    }
                  },
                },
              )
            }}
            className="rounded-lg bg-violet-600 px-6 py-2 text-white transition hover:bg-violet-500 disabled:opacity-60"
          >
            {mutation.isPending ? 'Running…' : 'Run simulation'}
          </button>
        </div>
      </div>

      {result && finalValue != null ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 text-center shadow-glow">
            <div className="text-sm font-medium text-white/55">Growth summary</div>
            <p className="mt-4 text-lg text-white/85">
              Your{' '}
              <span className="font-semibold text-white">{formatCurrencyINR(Number(result.initial_capital ?? initialCapital))}</span>{' '}
              grew to
            </p>
            <div className="mt-3 text-4xl font-bold text-emerald-400 md:text-5xl">
              <AnimatedRupee
                key={`${finalValue}-${Number(result.initial_capital ?? initialCapital)}`}
                from={Number(result.initial_capital ?? initialCapital)}
                to={finalValue}
              />
            </div>
            <p className="mt-4 text-sm text-white/50">
              {String(result.start_date ?? '')} → {String(result.end_date ?? '')}
            </p>
          </div>

          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-glow">
            <div className="text-lg font-semibold text-white">Equity curve</div>
            <div className="mt-4">
              <EquityCurveChart data={equityPoints.length ? equityPoints : [{ date: '—', value: initialCapital }]} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['CAGR %', result.cagr_pct],
              ['Sharpe', result.sharpe_ratio],
              ['Max DD %', result.max_drawdown_pct],
              ['Win rate %', result.win_rate_pct],
              ['Profit factor', result.profit_factor],
              ['Calmar', result.calmar_ratio],
              ['Best day %', result.best_day_pct],
              ['Worst day %', result.worst_day_pct],
            ].map((row) => {
              const label = row[0] as string
              const val = row[1]
              return (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.08)] bg-black/20 px-4 py-3 text-sm"
                >
                  <span className="text-white/55">{label}</span>
                  <span className="font-medium tabular-nums text-white">{String(val ?? '—')}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      ) : null}
    </div>
  )
}
