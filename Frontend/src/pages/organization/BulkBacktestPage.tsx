import { useState } from 'react'
import { useBacktest } from '../../hooks/useBacktest'
import StrategyTable from '../../components/dashboard/StrategyTable'
import { buildStrategyTableColumns } from '../../lib/backtestColumns'
import { STRATEGIES_CATALOG } from '../../data/strategiesCatalog'
import ApiMockBadge from '../../components/ui/ApiMockBadge'

const card = 'rounded-xl border border-white/[0.08] bg-[#12121A] p-5'

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

  const rows = (mutation.data?.backtests.nifty ?? []) as Array<Record<string, unknown>>
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

      {mutation.data && nifty ? (
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
          <StrategyTable title="NIFTY — filtered selection" rows={filteredRows.length ? filteredRows : rows} columns={cols} />
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
