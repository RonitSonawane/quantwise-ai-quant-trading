import { useMemo, useState, type CSSProperties } from 'react'
import { useBacktest } from '../../hooks/useBacktest'
import StrategyTable from '../../components/dashboard/StrategyTable'
import { buildStrategyTableColumns } from '../../lib/backtestColumns'
import { STRATEGIES_CATALOG } from '../../data/strategiesCatalog'
import ApiMockBadge from '../../components/ui/ApiMockBadge'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from 'recharts'

const card = 'rounded-xl border border-white/[0.08] bg-[#12121A] p-5'

const mockBulkResults = [
  { rank: 1, strategy: 'Combined_v3', annReturn: 39.91, sharpe: 0.91, maxDD: -12.5, winRate: 54.2, finalValue: 3943200, status: 'Winner' as const },
  { rank: 2, strategy: 'ML_Signal', annReturn: 36.33, sharpe: 0.88, maxDD: -15.2, winRate: 51.8, finalValue: 2482663, status: 'Strong' as const },
  { rank: 3, strategy: 'Regime_Aware_v3', annReturn: 34.64, sharpe: 0.85, maxDD: -13.3, winRate: 45.4, finalValue: 1985644, status: 'Strong' as const },
  { rank: 4, strategy: 'Dual_Momentum', annReturn: 22.1, sharpe: 1.12, maxDD: -8.5, winRate: 48.2, finalValue: 892000, status: 'Good' as const },
  { rank: 5, strategy: 'MTM', annReturn: 21.4, sharpe: 1.08, maxDD: -9.1, winRate: 47.5, finalValue: 856000, status: 'Good' as const },
  { rank: 6, strategy: 'VATR', annReturn: 18.5, sharpe: 0.95, maxDD: -10.2, winRate: 46.1, finalValue: 720000, status: 'Watch' as const },
  { rank: 7, strategy: 'ZScore_MeanRev', annReturn: 15.2, sharpe: 0.78, maxDD: -11.8, winRate: 42.3, finalValue: 580000, status: 'Watch' as const },
  { rank: 8, strategy: 'Buy_Hold', annReturn: 10.39, sharpe: 0.345, maxDD: -59.86, winRate: 53.06, finalValue: 581349, status: 'Benchmark' as const },
]

const statusStyle: Record<string, CSSProperties> = {
  Winner: { background: 'rgba(234, 179, 8, 0.35)', color: '#fef3c7' },
  Strong: { background: 'rgba(34, 197, 94, 0.28)', color: '#bbf7d0' },
  Good: { background: 'rgba(59, 130, 246, 0.28)', color: '#bfdbfe' },
  Watch: { background: 'rgba(234, 179, 8, 0.2)', color: '#fef08a' },
  Benchmark: { background: 'rgba(148, 163, 184, 0.25)', color: '#e2e8f0' },
}

function downloadBulkCsv(rows: typeof mockBulkResults) {
  const header = ['Rank', 'Strategy', 'Ann Return%', 'Sharpe', 'Max DD%', 'Win Rate%', 'Final Value', 'Status']
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [r.rank, r.strategy, r.annReturn, r.sharpe, r.maxDD, r.winRate, r.finalValue, r.status].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'quantwise-bulk-backtest-results.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function OrganizationBulkBacktestPage() {
  const mutation = useBacktest()
  const [nifty, setNifty] = useState(true)
  const [sp, setSp] = useState(false)
  const [start, setStart] = useState('2000-01-01')
  const [end, setEnd] = useState('2026-01-01')
  const [cap, setCap] = useState(100000)
  const [sel, setSel] = useState<Set<string>>(() => new Set(STRATEGIES_CATALOG.map((s) => s.id)))
  const [phase, setPhase] = useState<'idle' | 'run'>('idle')
  const [prog, setProg] = useState<Record<string, 'Queued' | 'Running' | 'Complete'>>({})

  const allComplete = useMemo(() => {
    const ids = Object.keys(prog)
    return ids.length > 0 && ids.every((id) => prog[id] === 'Complete')
  }, [prog])

  const equityComparison = useMemo(
    () =>
      Array.from({ length: 48 }).map((_, i) => {
        const t = i / 47
        return {
          x: String(i + 1),
          Combined_v3: 1000000 * (1 + 2.94 * t),
          ML_Signal: 1000000 * (1 + 2.48 * t),
          Regime_Aware_v3: 1000000 * (1 + 1.98 * t),
          Dual_Momentum: 1000000 * (1 + 0.89 * t),
        }
      }),
    [],
  )

  const toggle = (id: string) => {
    setSel((p) => {
      const n = new Set(p)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const run = () => {
    setPhase('run')
    const ids = [...sel]
    const init: Record<string, 'Queued' | 'Running' | 'Complete'> = {}
    ids.forEach((id) => {
      init[id] = 'Queued'
    })
    setProg(init)
    let i = 0
    const step = () => {
      if (i < ids.length) {
        const id = ids[i]
        setProg((p) => ({ ...p, [id]: 'Running' }))
        window.setTimeout(() => {
          setProg((p) => ({ ...p, [id]: 'Complete' }))
          i += 1
          step()
        }, 400 + Math.random() * 500)
      }
    }
    step()
    mutation.mutate(
      { start_date: start, end_date: end, initial_capital: cap, refresh_data: false },
      {
        onSettled: () => setPhase('idle'),
      },
    )
  }

  const rows = (mutation.data?.backtests?.nifty ?? []) as Array<Record<string, unknown>>
  const cols = buildStrategyTableColumns(rows[0])
  const filteredRows = rows.filter((r) => sel.has(String(r.Strategy)))

  const inputCls =
    'mt-1 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white [color-scheme:dark]'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Bulk backtest</h1>
        <p className="mt-1 text-sm text-white/55">Queue multiple sleeves against shared calendar settings.</p>
      </div>

      <div className={card}>
        <h2 className="text-lg font-semibold text-white">Configuration</h2>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={nifty} onChange={() => setNifty((x) => !x)} />
            NIFTY 50
          </label>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={sp} onChange={() => setSp((x) => !x)} />
            S&amp;P 500
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm">
            <span className="text-white/60">Start</span>
            <input type="date" className={inputCls} value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="text-white/60">End</span>
            <input type="date" className={inputCls} value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="text-white/60">Capital (Rs)</span>
            <input type="number" className={inputCls} value={cap} onChange={(e) => setCap(Number(e.target.value))} min={1000} />
          </label>
        </div>
        <div className="mt-4 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-3">
          {STRATEGIES_CATALOG.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-xs text-white/75">
              <input type="checkbox" checked={sel.has(s.id)} onChange={() => toggle(s.id)} />
              {s.id}
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={mutation.isPending || phase === 'run' || (!nifty && !sp)}
          onClick={run}
          className="mt-4 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
        >
          Run all selected
        </button>
        <div className="mt-2">
          <ApiMockBadge show={mutation.isError} />
        </div>
      </div>

      {Object.keys(prog).length > 0 ? (
        <div className={card}>
          <h2 className="text-lg font-semibold text-white">Progress</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.entries(prog).map(([id, st]) => (
              <li key={id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2">
                <span className="text-white/80">{id}</span>
                <span
                  className={
                    st === 'Complete' ? 'text-emerald-400' : st === 'Running' ? 'text-violet-300' : 'text-white/45'
                  }
                >
                  {st}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-white/45">ETA: ~{Math.max(1, sel.size * 0.5).toFixed(0)} min (mock sequencing)</p>
        </div>
      ) : null}

      {allComplete ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={card}>
              <div className="text-xs text-white/45">Best overall</div>
              <div className="mt-2 text-sm font-semibold text-white">Combined_v3 | 39.91% ann return</div>
            </div>
            <div className={card}>
              <div className="text-xs text-white/45">Highest Sharpe</div>
              <div className="mt-2 text-sm font-semibold text-white">Dual_Momentum | 1.12</div>
            </div>
            <div className={card}>
              <div className="text-xs text-white/45">Lowest drawdown</div>
              <div className="mt-2 text-sm font-semibold text-white">Dual_Momentum | -8.5%</div>
            </div>
            <div className={card}>
              <div className="text-xs text-white/45">Most consistent</div>
              <div className="mt-2 text-sm font-semibold text-white">Regime_Aware_v3</div>
            </div>
          </div>

          <div className={card}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Results summary</h2>
              <button
                type="button"
                onClick={() => downloadBulkCsv(mockBulkResults)}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500"
              >
                Export CSV
              </button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-white/45">
                    <th className="pb-2 pr-2">Rank</th>
                    <th className="pb-2 pr-2">Strategy</th>
                    <th className="pb-2 pr-2">Ann Return%</th>
                    <th className="pb-2 pr-2">Sharpe</th>
                    <th className="pb-2 pr-2">Max DD%</th>
                    <th className="pb-2 pr-2">Win Rate%</th>
                    <th className="pb-2 pr-2">Final Value</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBulkResults.map((r) => (
                    <tr key={r.rank} className="border-b border-white/[0.06] text-white/85">
                      <td className="py-2 pr-2">{r.rank}</td>
                      <td className="py-2 pr-2 font-medium text-white">{r.strategy}</td>
                      <td className="py-2 pr-2 tabular-nums">{r.annReturn.toFixed(2)}</td>
                      <td className="py-2 pr-2 tabular-nums">{r.sharpe}</td>
                      <td className="py-2 pr-2 tabular-nums">{r.maxDD}</td>
                      <td className="py-2 pr-2 tabular-nums">{r.winRate.toFixed(2)}</td>
                      <td className="py-2 pr-2 tabular-nums">{r.finalValue.toLocaleString('en-IN')}</td>
                      <td className="py-2">
                        <span className="rounded-md px-2 py-1 text-xs font-medium" style={statusStyle[r.status] ?? {}}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={card}>
            <h2 className="text-lg font-semibold text-white">Equity comparison (top strategies, mock)</h2>
            <p className="mt-1 text-xs text-white/45">Normalized mock curves for illustration after bulk run.</p>
            <div style={{ width: '100%', height: 320, minWidth: 0, minHeight: 0 }} className="mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityComparison} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="x" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} interval={6} />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
                    width={72}
                    tickFormatter={(v) => `${Math.round(Number(v) / 100000)}L`}
                  />
                  <Tooltip contentStyle={{ background: '#0b0b12', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Combined_v3" stroke="#7c3aed" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="ML_Signal" stroke="#0d9488" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="Regime_Aware_v3" stroke="#2563eb" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="Dual_Momentum" stroke="#f59e0b" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}

      {mutation.data && nifty && rows.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Best overall', 'Combined_v3'],
              ['Highest return', '39.91% (Combined_v3 NIFTY)'],
              ['Highest Sharpe', '0.91 (Combined_v3)'],
              ['Most consistent', 'Regime_Aware_v3'],
            ].map(([a, b]) => (
              <div key={a} className={card}>
                <div className="text-xs text-white/45">{a}</div>
                <div className="mt-2 text-sm font-semibold text-white">{b}</div>
              </div>
            ))}
          </div>
          <StrategyTable title="NIFTY — filtered selection (API)" rows={filteredRows.length ? filteredRows : rows} columns={cols} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5">
              Download CSV
            </button>
            <button type="button" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5">
              Download PDF report
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
