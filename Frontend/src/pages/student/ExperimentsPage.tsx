import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WebGLGate from '../../components/layout/WebGLGate'
import ExperimentsBars3D from '../../components/3d/ExperimentsBars3D'
import StrategyTable from '../../components/dashboard/StrategyTable'
import { buildStrategyTableColumns } from '../../lib/backtestColumns'
import { buildMultiStrategyEquityPoints } from '../../lib/strategyEquityMock'
import { loadExperiments, saveExperiments, removeExperiment, type SavedExperiment } from '../../lib/experimentsStorage'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from 'recharts'

const MOCK: SavedExperiment[] = [
  {
    id: 'm1',
    name: 'NIFTY regime sweep',
    runAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    indexLabel: 'NIFTY',
    strategies: ['Combined_v3', 'Buy_Hold'],
    bestReturnPct: 39.91,
    bestSharpe: 0.91,
    keyFinding: 'Combined_v3 dominated in bull segments.',
    notes: 'Compared tails during 2020 crash.',
  },
  {
    id: 'm2',
    name: 'SP500 ML focus',
    runAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    indexLabel: 'SP500',
    strategies: ['ML_Signal', 'Regime_Aware_v3'],
    bestReturnPct: 36.33,
    bestSharpe: 0.88,
    keyFinding: 'ML signal smoother drawdowns vs single-factor models.',
  },
  {
    id: 'm3',
    name: 'Bear study',
    runAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    indexLabel: 'BOTH',
    strategies: ['Defensive_Cash', 'Risk_Parity'],
    bestReturnPct: 14.2,
    bestSharpe: 0.72,
    keyFinding: 'Defensive sleeves preserved capital in Q1 stress.',
  },
  {
    id: 'm4',
    name: 'High-alpha basket',
    runAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    indexLabel: 'NIFTY',
    strategies: ['Dual_Momentum', 'MTM', 'VATR'],
    bestReturnPct: 28.4,
    bestSharpe: 0.79,
    keyFinding: 'Rotation between sleeves reduced variance.',
  },
]

const card = 'rounded-xl border border-white/[0.08] bg-[#12121A] p-4'

export default function ExperimentsPage() {
  const nav = useNavigate()
  const [list, setList] = useState<SavedExperiment[]>(() => loadExperiments())
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [fStrategy, setFStrategy] = useState('All')
  const [fIndex, setFIndex] = useState('All')
  const [highlightId, setHighlightId] = useState<string | null>(null)

  useEffect(() => {
    if (loadExperiments().length === 0) {
      saveExperiments(MOCK)
      setList(MOCK)
    }
  }, [])

  const filtered = useMemo(() => {
    return list.filter((e) => {
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
      if (fStrategy !== 'All' && !e.strategies.includes(fStrategy)) return false
      if (fIndex !== 'All' && e.indexLabel !== fIndex) return false
      return true
    })
  }, [list, search, fStrategy, fIndex])

  const bars = useMemo(
    () =>
      filtered.map((e) => ({
        id: e.id,
        label: e.name.slice(0, 10),
        height: Math.max(5, e.bestReturnPct),
      })),
    [filtered],
  )

  const mockTableRows = useMemo(
    () => [
      { Strategy: 'Combined_v3', 'Cumulative Return (%)': 39.91, 'Sharpe Ratio': 0.91 },
      { Strategy: 'ML_Signal', 'Cumulative Return (%)': 36.33, 'Sharpe Ratio': 0.88 },
    ],
    [],
  )

  const chartData = useMemo(() => buildMultiStrategyEquityPoints(48), [])

  const refresh = useCallback(() => setList(loadExperiments()), [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">My research experiments</h1>
        <p className="mt-1 text-sm text-white/55">Saved runs from the research lab and class assignments.</p>
      </div>

      <WebGLGate
        fallback={<div className="h-[120px] rounded-xl border border-dashed border-white/15 bg-black/30 p-4 text-sm text-white/45">3D view needs WebGL.</div>}
      >
        <ExperimentsBars3D bars={bars} selectedId={highlightId} onSelect={(id) => setHighlightId(id)} />
      </WebGLGate>

      <div className={`${card} flex flex-wrap gap-3`}>
        <input
          placeholder="Search name…"
          className="min-w-[160px] flex-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
          value={fStrategy}
          onChange={(e) => setFStrategy(e.target.value)}
        >
          <option>All</option>
          <option>Combined_v3</option>
          <option>ML_Signal</option>
          <option>Buy_Hold</option>
        </select>
        <select
          className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
          value={fIndex}
          onChange={(e) => setFIndex(e.target.value)}
        >
          <option>All</option>
          <option>NIFTY</option>
          <option>SP500</option>
          <option>BOTH</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((e) => (
          <div
            key={e.id}
            className={`${card} ${highlightId === e.id ? 'ring-1 ring-violet-500/50' : ''}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-lg font-bold text-white">{e.name}</div>
                <div className="text-xs text-white/45">{new Date(e.runAt).toLocaleString()}</div>
              </div>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/60">{e.indexLabel}</span>
            </div>
            <div className="mt-2 text-xs text-white/50">{e.strategies.join(', ')}</div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <span className="text-emerald-400">Best return: {e.bestReturnPct.toFixed(2)}%</span>
              <span className="text-white/70">Best Sharpe: {e.bestSharpe.toFixed(2)}</span>
            </div>
            {e.keyFinding ? <p className="mt-3 text-sm italic text-white/60">&ldquo;{e.keyFinding}&rdquo;</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs text-white hover:bg-violet-500"
                onClick={() => setExpanded((x) => (x === e.id ? null : e.id))}
              >
                {expanded === e.id ? 'Hide details' : 'View details'}
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5"
                onClick={() => nav('/student/research-lab')}
              >
                Re-run
              </button>
              <button
                type="button"
                className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                onClick={() => {
                  removeExperiment(e.id)
                  refresh()
                }}
              >
                Delete
              </button>
            </div>
            {expanded === e.id ? (
              <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                <StrategyTable title="Snapshot metrics (illustrative)" rows={mockTableRows as any} columns={buildStrategyTableColumns(mockTableRows[0])} />
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="x" tick={false} />
                      <YAxis width={48} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: '#0b0b12', border: '1px solid rgba(255,255,255,0.08)' }} />
                      <Legend />
                      <Line dataKey="Combined_v3" stroke="#7c3aed" dot={false} />
                      <Line dataKey="Buy_Hold" stroke="#9ca3af" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
