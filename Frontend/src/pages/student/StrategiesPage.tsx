import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { STRATEGIES_CATALOG, typeBadgeClass, type StrategyTypeCat } from '../../data/strategiesCatalog'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

const tabs: Array<'All' | StrategyTypeCat> = ['All', 'Trend', 'Mean Reversion', 'Defensive', 'High-Alpha']

const card = 'rounded-xl border border-white/[0.08] bg-[#12121A] p-4'

export default function StudentStrategiesPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('All')
  const [modalId, setModalId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (tab === 'All') return STRATEGIES_CATALOG
    return STRATEGIES_CATALOG.filter((s) => s.type === tab)
  }, [tab])

  const modal = STRATEGIES_CATALOG.find((s) => s.id === modalId)

  const mini = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        x: i,
        s: 100 + i * 80 + Math.sin(i) * 20,
        bh: 100 + i * 35,
      })),
    [],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Strategy library</h1>
        <p className="mt-1 text-sm text-white/55">All sleeves including research, ML, and regime-aware stacks.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              tab === t ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.id} className={card}>
            <div className="flex items-start justify-between gap-2">
              <div className="text-base font-bold text-white">{s.name}</div>
              {s.highAlpha ? (
                <span className="shrink-0 rounded border border-amber-400/50 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200">
                  High alpha
                </span>
              ) : null}
            </div>
            <span className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-xs ${typeBadgeClass(s.type)}`}>{s.type}</span>
            <p className="mt-3 text-sm text-white/65">{s.short}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/55">
              <div>Avg NIFTY (mock): {s.avgNiftyReturnMock}</div>
              <div>Sharpe (mock): {s.sharpeMock}</div>
              <div className="col-span-2">Best regime: {s.bestRegime}</div>
            </div>
            <button
              type="button"
              onClick={() => setModalId(s.id)}
              className="mt-4 w-full rounded-lg bg-violet-600/90 py-2 text-sm text-white hover:bg-violet-500"
            >
              Learn more
            </button>
          </div>
        ))}
      </div>

      {modal ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="dialog">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-[#12121A] p-6 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-semibold text-white">{modal.name}</h2>
                <span className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-xs ${typeBadgeClass(modal.type)}`}>
                  {modal.type}
                </span>
              </div>
              <button type="button" onClick={() => setModalId(null)} className="rounded-lg p-2 text-white/60 hover:bg-white/10">
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-4 text-sm text-white/70">{modal.detail}</p>
            <div className="mt-4 space-y-2 text-sm text-white/65">
              <div>
                <span className="font-semibold text-white/85">Logic:</span> {modal.logic}
              </div>
              <div>
                <span className="font-semibold text-emerald-300/90">Works best:</span> {modal.bestRegime}
              </div>
              <div>
                <span className="font-semibold text-red-300/90">Fails when:</span> {modal.failsWhen}
              </div>
            </div>
            <div className="mt-6">
              <div className="text-xs font-semibold uppercase text-white/45">Vs Buy &amp; Hold (mock)</div>
              <div style={{ width: '100%', height: 200 }} className="mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mini} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="x" tick={false} />
                    <YAxis width={40} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0b0b12', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <Line dataKey="s" stroke="#7c3aed" dot={false} name={modal.name} />
                    <Line dataKey="bh" stroke="#9ca3af" dot={false} name="Buy_Hold" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
