import { useMemo, useState } from 'react'
import type { BacktestResponse } from '../../api/backtest'
import { useBacktest } from '../../hooks/useBacktest'
import StrategyTable from '../../components/dashboard/StrategyTable'

type IndexChoice = 'NIFTY' | 'SP500' | 'BOTH'

const stepLabels = [
  'Downloading data...',
  'Engineering features...',
  'Training HMM...',
  'Running strategies...',
  'Training ML model...',
  'Generating results...',
]

export default function IndividualBacktestPage() {
  const mutation = useBacktest()

  const [indexChoice, setIndexChoice] = useState<IndexChoice>('BOTH')
  const [startDate, setStartDate] = useState('2000-01-01')
  const [endDate, setEndDate] = useState('2026-01-01')
  const [initialCapital, setInitialCapital] = useState<number>(100000)
  const [strategyFilter, setStrategyFilter] = useState<string>('All')

  const [stepIdx, setStepIdx] = useState<number>(0)
  const [running, setRunning] = useState<boolean>(false)

  const [result, setResult] = useState<BacktestResponse | null>(null)

  const highlightByStrategy = useMemo(() => {
    return {
      Combined_v3: 'bg-purple-500/15',
      Regime_Aware_v3: 'bg-blue-500/15',
      ML_Signal: 'bg-emerald-500/10',
      Buy_Hold: 'bg-white/5',
    }
  }, [])

  const knownStrategies = useMemo(() => {
    return ['All', 'Combined_v3', 'Regime_Aware_v3', 'ML_Signal', 'Buy_Hold']
  }, [])

  return (
    <div className="mx-auto max-w-7xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white/90">Backtest</h1>
            <p className="mt-1 text-sm text-white/60">Run the full QuantWise v3 research pipeline.</p>
          </div>
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => {
              setRunning(true)
              setStepIdx(0)
              setResult(null)
              let i = 0
              const t = window.setInterval(() => {
                i += 1
                setStepIdx(Math.min(i, stepLabels.length - 1))
                if (i >= stepLabels.length - 1) window.clearInterval(t)
              }, 850)

              mutation.mutate(
                {
                  start_date: startDate,
                  end_date: endDate,
                  initial_capital: initialCapital,
                  refresh_data: false,
                },
                {
                  onSuccess: (data) => {
                    window.clearInterval(t)
                    setResult(data)
                    setRunning(false)
                  },
                  onError: () => {
                    window.clearInterval(t)
                    setRunning(false)
                  },
                },
              )
            }}
            className="rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-95 disabled:opacity-70"
          >
            {mutation.isPending ? 'Running...' : 'Run Backtest'}
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-sm text-white/70">Select Index</span>
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white/90"
              value={indexChoice}
              onChange={(e) => setIndexChoice(e.target.value as IndexChoice)}
            >
              <option value="NIFTY">NIFTY 50</option>
              <option value="SP500">S&P 500</option>
              <option value="BOTH">Both</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-white/70">Start Date</span>
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white/90"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/70">End Date</span>
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white/90"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
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

          <label className="block md:col-span-2 lg:col-span-4">
            <span className="text-sm text-white/70">Select Strategy</span>
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white/90"
              value={strategyFilter}
              onChange={(e) => setStrategyFilter(e.target.value)}
            >
              {knownStrategies.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        {running ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold text-white/80">Backtest Progress</div>
            <ol className="mt-3 space-y-2 text-sm text-white/70">
              {stepLabels.map((s, idx) => (
                <li key={s} className={idx <= stepIdx ? 'text-white' : ''}>
                  <span className="mr-2 inline-block w-4 text-xs text-purple-300">{idx <= stepIdx ? '✓' : '•'}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>

      {result ? (
        <div className="mt-5 space-y-5">
          {indexChoice !== 'SP500' ? (
            <StrategySection
              title="NIFTY 50"
              records={result.backtests.nifty}
              strategyFilter={strategyFilter}
              highlightByStrategy={highlightByStrategy}
            />
          ) : null}

          {indexChoice !== 'NIFTY' ? (
            <StrategySection
              title="S&P 500"
              records={result.backtests.sp500}
              strategyFilter={strategyFilter}
              highlightByStrategy={highlightByStrategy}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function StrategySection({
  title,
  records,
  strategyFilter,
  highlightByStrategy,
}: {
  title: string
  records: Array<Record<string, unknown>>
  strategyFilter: string
  highlightByStrategy: Record<string, string>
}) {
  const rows = useMemo(() => {
    if (strategyFilter === 'All') return records
    return records.filter((r) => String(r['Strategy'] ?? '') === strategyFilter)
  }, [records, strategyFilter])

  const columns = useMemo(() => {
    const first = rows[0] ?? {}
    const keys = Object.keys(first).filter((k) => k !== 'Strategy')
    return keys.map((k) => ({ key: k, label: k }))
  }, [rows])

  return (
    <StrategyTable title={`${title} — Strategy Comparison`} rows={rows as any} columns={columns} highlightByStrategy={highlightByStrategy} />
  )
}

