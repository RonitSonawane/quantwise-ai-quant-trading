import { useEffect, useMemo, useRef, useState } from 'react'
import type { BacktestResponse } from '../../api/backtest'
import { useBacktest } from '../../hooks/useBacktest'
import StrategyTable from '../../components/dashboard/StrategyTable'
import StrategyComparisonChart from '../../components/charts/StrategyComparisonChart'
import { buildStrategyTableColumns } from '../../lib/backtestColumns'

type IndexChoice = 'NIFTY' | 'SP500' | 'BOTH'

const STEPS = [
  'Downloading market data...',
  'Engineering 59 features...',
  'Training 6-state HMM...',
  'Running 15 strategies...',
  'Training ML ensemble...',
  'Generating results...',
]

const inputCls =
  'mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-zinc-950 px-3 py-2.5 text-sm text-white shadow-inner [color-scheme:dark] outline-none ring-0 focus:border-violet-500/60'

export default function IndividualBacktestPage() {
  const mutation = useBacktest()
  const intervalRef = useRef<number | null>(null)

  const [indexChoice, setIndexChoice] = useState<IndexChoice>('BOTH')
  const [startDate, setStartDate] = useState('2000-01-01')
  const [endDate, setEndDate] = useState('2026-01-01')
  const [initialCapital, setInitialCapital] = useState<number>(100000)
  const [strategyFilter, setStrategyFilter] = useState<string>('All')

  const [stepIdx, setStepIdx] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'running'>('idle')

  const [result, setResult] = useState<BacktestResponse | null>(null)

  const clearStepInterval = () => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    return () => clearStepInterval()
  }, [])

  const knownStrategies = useMemo(() => ['All', 'Combined_v3', 'Regime_Aware_v3', 'ML_Signal', 'Buy_Hold'], [])

  const runBacktest = () => {
    clearStepInterval()
    setResult(null)
    setPhase('running')
    setStepIdx(0)

    intervalRef.current = window.setInterval(() => {
      setStepIdx((s) => Math.min(s + 1, STEPS.length - 1))
    }, 20000)

    mutation.mutate(
      {
        start_date: startDate,
        end_date: endDate,
        initial_capital: initialCapital,
        refresh_data: false,
      },
      {
        onSuccess: (data) => {
          clearStepInterval()
          setResult(data)
          setStepIdx(STEPS.length - 1)
          setPhase('idle')
        },
        onError: () => {
          clearStepInterval()
          setPhase('idle')
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-white">Backtest</h1>

      <div className="mx-auto w-full max-w-3xl rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-glow">
        <div className="text-center">
          <p className="text-sm text-white/60">Run the full QuantWise v3 research pipeline on historical data.</p>
        </div>

        <div className="mx-auto mt-8 grid max-w-xl gap-5">
          <label className="block text-left">
            <span className="text-sm font-medium text-white/75">Select index</span>
            <select className={inputCls} value={indexChoice} onChange={(e) => setIndexChoice(e.target.value as IndexChoice)}>
              <option value="NIFTY">NIFTY 50</option>
              <option value="SP500">S&amp;P 500</option>
              <option value="BOTH">Both</option>
            </select>
          </label>

          <label className="block text-left">
            <span className="text-sm font-medium text-white/75">Start date</span>
            <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>

          <label className="block text-left">
            <span className="text-sm font-medium text-white/75">End date</span>
            <input type="date" className={inputCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>

          <label className="block text-left">
            <span className="text-sm font-medium text-white/75">Initial capital (Rs)</span>
            <input
              type="number"
              className={inputCls}
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              min={1000}
            />
          </label>

          <label className="block text-left">
            <span className="text-sm font-medium text-white/75">Filter strategy in tables</span>
            <select className={inputCls} value={strategyFilter} onChange={(e) => setStrategyFilter(e.target.value)}>
              {knownStrategies.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            disabled={phase === 'running'}
            onClick={runBacktest}
            className="rounded-lg bg-violet-600 px-6 py-2 text-white transition hover:bg-violet-500 disabled:opacity-60"
          >
            {phase === 'running' ? 'Running…' : 'Run backtest'}
          </button>
        </div>

        {phase === 'running' ? (
          <div className="mx-auto mt-8 max-w-lg rounded-xl border border-[rgba(255,255,255,0.08)] bg-black/30 p-5">
            <div className="text-sm font-semibold text-white/85">Pipeline progress</div>
            <ol className="mt-4 space-y-3">
              {STEPS.map((s, idx) => (
                <li
                  key={s}
                  className={`flex items-center gap-3 text-sm ${idx <= stepIdx ? 'text-white' : 'text-white/35'}`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs ${
                      idx < stepIdx
                        ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                        : idx === stepIdx
                          ? 'border-violet-500/60 bg-violet-500/15 text-violet-200'
                          : 'border-white/10 bg-white/5'
                    }`}
                  >
                    {idx < stepIdx ? '✓' : idx + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-white/45">Steps advance every ~20s while the job runs; results appear when the API responds.</p>
          </div>
        ) : null}
      </div>

      {result ? (
        <div className="space-y-6">
          {indexChoice !== 'SP500' ? (
            <StrategySection
              title="NIFTY 50"
              records={result.backtests.nifty as Array<Record<string, unknown>>}
              strategyFilter={strategyFilter}
            />
          ) : null}

          {indexChoice !== 'NIFTY' ? (
            <StrategySection
              title="S&amp;P 500"
              records={result.backtests.sp500 as Array<Record<string, unknown>>}
              strategyFilter={strategyFilter}
            />
          ) : null}

          <div>
            <div className="mb-3 text-lg font-semibold text-white">Equity curves (mock end values)</div>
            <StrategyComparisonChart height={300} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function StrategySection({
  title,
  records,
  strategyFilter,
}: {
  title: string
  records: Array<Record<string, unknown>>
  strategyFilter: string
}) {
  const rows = useMemo(() => {
    if (strategyFilter === 'All') return records
    return records.filter((r) => String(r['Strategy'] ?? '') === strategyFilter)
  }, [records, strategyFilter])

  const columns = useMemo(() => buildStrategyTableColumns(rows[0]), [rows])

  if (!rows.length) {
    return <div className="text-sm text-white/55">No strategy rows to display for this filter.</div>
  }
  if (!columns.length) {
    return <div className="text-sm text-white/55">Unexpected empty column set from API.</div>
  }

  return <StrategyTable title={`${title} — strategy comparison`} rows={rows} columns={columns} />
}
