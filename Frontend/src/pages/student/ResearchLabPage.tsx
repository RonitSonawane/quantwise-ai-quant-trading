import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useBacktest } from '../../hooks/useBacktest'
import { fetchStrategiesSeries } from '../../api/strategies'
import type { BacktestResponse } from '../../api/backtest'
import StrategyTable from '../../components/dashboard/StrategyTable'
import { buildStrategyTableColumns } from '../../lib/backtestColumns'
import ApiMockBadge from '../../components/ui/ApiMockBadge'
import { STRATEGIES_CATALOG } from '../../data/strategiesCatalog'
import { addExperiment } from '../../lib/experimentsStorage'
import type { AssetId } from '../../types'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from 'recharts'

const COLORS = ['#7c3aed', '#0d9488', '#2563eb', '#9ca3af', '#f59e0b', '#ec4899', '#22c55e']

export default function StudentResearchLabPage() {
  const mutation = useBacktest()
  const [name, setName] = useState('Untitled experiment')
  const [indexChoice, setIndexChoice] = useState<'NIFTY' | 'SP500' | 'BOTH'>('NIFTY')
  const [startDate, setStartDate] = useState('2000-01-01')
  const [endDate, setEndDate] = useState('2026-01-01')
  const [capital, setCapital] = useState(100000)
  const [notes, setNotes] = useState('')
  const [keyFinding, setKeyFinding] = useState('')

  const allIds = useMemo(() => STRATEGIES_CATALOG.map((s) => s.id), [])
  const [selected, setSelected] = useState<Set<string>>(() => new Set(['Combined_v3', 'Buy_Hold', 'ML_Signal', 'Regime_Aware_v3']))

  const [result, setResult] = useState<BacktestResponse | null>(null)
  const assetForChart: AssetId | null = indexChoice === 'SP500' ? 'sp500' : 'nifty'

  const strategiesQ = useQuery({
    queryKey: ['strategies-lab', assetForChart, result?.meta],
    queryFn: () => fetchStrategiesSeries({ asset: assetForChart!, limit_points: 400 }),
    enabled: !!result && !!assetForChart && (indexChoice === 'NIFTY' || indexChoice === 'SP500' || indexChoice === 'BOTH'),
    retry: 1,
  })

  const chartRows = useMemo(() => {
    const data = strategiesQ.data?.data
    if (!data?.length) return []
    const keys = [...selected].filter((k) => strategiesQ.data?.strategies?.includes(k))
    if (!keys.length) return []
    const acc: Record<string, number> = {}
    const start = Number(capital)
    return data.map((row: Record<string, unknown>) => {
      const pt: Record<string, string | number> = { x: String(row.date).slice(0, 10) }
      for (const k of keys) {
        const daily = Number(row[k] ?? 0)
        acc[k] = (acc[k] ?? start) * (1 + daily)
        pt[k] = acc[k]
      }
      return pt
    })
  }, [strategiesQ.data, selected, capital])

  const chartKeys = useMemo(() => {
    const keys = [...selected].filter((k) => strategiesQ.data?.strategies?.includes(k))
    return keys.slice(0, 8)
  }, [selected, strategiesQ.data])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white [color-scheme:dark] focus:border-violet-500/50'

  const records = useMemo(() => {
    if (!result) return []
    if (indexChoice === 'SP500') return result.backtests.sp500 as Array<Record<string, unknown>>
    return result.backtests.nifty as Array<Record<string, unknown>>
  }, [result, indexChoice])

  const bothRecords = useMemo(() => {
    if (!result || indexChoice !== 'BOTH') return null
    return {
      nifty: result.backtests.nifty as Array<Record<string, unknown>>,
      sp500: result.backtests.sp500 as Array<Record<string, unknown>>,
    }
  }, [result, indexChoice])

  const columns = buildStrategyTableColumns(records[0])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Research lab</h1>
        <p className="mt-1 text-sm text-white/55">Frame a hypothesis, run the pipeline, and record what you learned.</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full space-y-4 rounded-xl border border-white/[0.08] bg-[#12121A] p-5 lg:w-[40%]">
          <h2 className="text-lg font-semibold text-white">Experiment setup</h2>

          <label className="block text-sm">
            <span className="text-white/70">Experiment name</span>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="block text-sm">
            <span className="text-white/70">Index</span>
            <select
              className={inputCls}
              value={indexChoice}
              onChange={(e) => setIndexChoice(e.target.value as typeof indexChoice)}
            >
              <option value="NIFTY">NIFTY 50</option>
              <option value="SP500">S&amp;P 500</option>
              <option value="BOTH">Both</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-white/70">Start</span>
              <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="text-white/70">End</span>
              <input type="date" className={inputCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-white/70">Initial capital (Rs)</span>
            <input type="number" className={inputCls} value={capital} onChange={(e) => setCapital(Number(e.target.value))} min={1000} />
          </label>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Strategies to compare</span>
              <div className="flex gap-2">
                <button type="button" className="text-xs text-violet-400 hover:underline" onClick={() => setSelected(new Set(allIds))}>
                  Select all
                </button>
                <button type="button" className="text-xs text-white/45 hover:underline" onClick={() => setSelected(new Set())}>
                  Deselect all
                </button>
              </div>
            </div>
            <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-white/[0.08] bg-black/30 p-2">
              {allIds.map((id) => (
                <label key={id} className="flex cursor-pointer items-center gap-2 text-xs text-white/80">
                  <input type="checkbox" checked={selected.has(id)} onChange={() => toggle(id)} className="rounded border-white/20" />
                  {id}
                </label>
              ))}
            </div>
          </div>

          <label className="block text-sm">
            <span className="text-white/70">Experiment notes (hypothesis)</span>
            <textarea className={`${inputCls} min-h-[88px] resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>

          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => {
              setResult(null)
              mutation.mutate(
                { start_date: startDate, end_date: endDate, initial_capital: capital, refresh_data: false },
                { onSuccess: (d) => setResult(d) },
              )
            }}
            className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-60"
          >
            {mutation.isPending ? 'Running…' : 'Run experiment'}
          </button>
          <ApiMockBadge show={mutation.isError} />
        </div>

        <div className="min-w-0 flex-1 space-y-4 rounded-xl border border-white/[0.08] bg-[#12121A] p-5 lg:w-[60%]">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Results</h2>
            <ApiMockBadge show={strategiesQ.isError || !!mutation.isError} />
          </div>

          {!result ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-black/25 p-8 text-center text-sm text-white/55">
              <p>Select parameters and run an experiment.</p>
              <p className="mt-3 text-white/40">Tip: start by comparing Combined_v3 vs Buy_Hold.</p>
            </div>
          ) : (
            <>
              {indexChoice === 'BOTH' && bothRecords ? (
                <div className="space-y-4">
                  <StrategyTable title="NIFTY 50" rows={bothRecords.nifty} columns={buildStrategyTableColumns(bothRecords.nifty[0])} />
                  <StrategyTable title="S&P 500" rows={bothRecords.sp500} columns={buildStrategyTableColumns(bothRecords.sp500[0])} />
                </div>
              ) : (
                <StrategyTable title="Strategy metrics" rows={records} columns={columns} />
              )}

              {(indexChoice === 'NIFTY' || indexChoice === 'SP500') && (
                <div>
                  <div className="text-sm font-medium text-white/80">Equity curves (selected strategies)</div>
                  {strategiesQ.isLoading ? (
                    <div className="mt-3 h-[280px] animate-pulse rounded-lg bg-white/5" />
                  ) : (
                    <div style={{ width: '100%', height: 300 }} className="mt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                          <XAxis dataKey="x" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} interval={30} />
                          <YAxis tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} width={56} />
                          <Tooltip contentStyle={{ background: '#0b0b12', border: '1px solid rgba(255,255,255,0.08)' }} />
                          <Legend />
                          {chartKeys.map((k, i) => (
                            <Line key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              <label className="block text-sm">
                <span className="text-white/70">Key finding</span>
                <textarea
                  className={inputCls + ' min-h-[72px]'}
                  value={keyFinding}
                  onChange={(e) => setKeyFinding(e.target.value)}
                  placeholder="What did you conclude from this run?"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  const best = records.reduce(
                    (a, b) => {
                      const av = Number(String(a['Cumulative Return (%)'] ?? 0).replace(/[^0-9.-]/g, '')) || 0
                      const bv = Number(String(b['Cumulative Return (%)'] ?? 0).replace(/[^0-9.-]/g, '')) || 0
                      return bv > av ? b : a
                    },
                    records[0] ?? {},
                  )
                  addExperiment({
                    id: crypto.randomUUID(),
                    name,
                    runAt: new Date().toISOString(),
                    indexLabel: indexChoice,
                    strategies: [...selected],
                    bestReturnPct: Number(String(best['Cumulative Return (%)'] ?? 0).replace(/[^0-9.-]/g, '')) || 0,
                    bestSharpe: Number(String(best['Sharpe Ratio'] ?? 0)) || 0,
                    keyFinding,
                    notes,
                    resultSnapshot: { rows: records.slice(0, 5) },
                  })
                  alert('Experiment saved to your list.')
                }}
                className="rounded-lg border border-violet-500/40 bg-violet-600/20 px-4 py-2 text-sm text-violet-100 hover:bg-violet-600/30"
              >
                Save experiment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
