import { Component, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import WebGLGate from '../../components/layout/WebGLGate'
import ExperimentsBars3D from '../../components/3d/ExperimentsBars3D'
import StrategyTable from '../../components/dashboard/StrategyTable'
import { buildStrategyTableColumns } from '../../lib/backtestColumns'
import { buildMultiStrategyEquityPoints } from '../../lib/strategyEquityMock'
import { loadExperiments, saveExperiments, removeExperiment, type SavedExperiment } from '../../lib/experimentsStorage'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from 'recharts'

function normalizedIndexLabel(l: string) {
  if (l === 'NIFTY' || l === 'NIFTY 50') return 'NIFTY 50'
  if (l === 'SP500' || l === 'S&P 500') return 'S&P 500'
  if (l === 'BOTH' || l === 'Both') return 'Both'
  return l
}

const SEED_EXPERIMENTS: SavedExperiment[] = [
  {
    id: 'seed-1',
    name: 'NIFTY Bull Market Analysis',
    runAt: '2025-04-10T12:00:00.000Z',
    indexLabel: 'NIFTY 50',
    strategies: ['Combined_v3'],
    bestReturnPct: 39.91,
    bestSharpe: 0.91,
    keyFinding: 'Combined_v3 outperforms Buy & Hold significantly in bull regimes',
  },
  {
    id: 'seed-2',
    name: 'S&P 500 Bear Study',
    runAt: '2025-04-09T12:00:00.000Z',
    indexLabel: 'S&P 500',
    strategies: ['Regime_Aware_v3'],
    bestReturnPct: 34.64,
    bestSharpe: 0.85,
    keyFinding: 'Regime switching reduces drawdown in bear markets',
  },
  {
    id: 'seed-3',
    name: 'ML Signal Accuracy Test',
    runAt: '2025-04-08T12:00:00.000Z',
    indexLabel: 'Both',
    strategies: ['ML_Signal'],
    bestReturnPct: 36.33,
    bestSharpe: 0.88,
    keyFinding: 'ML ensemble achieves 54% accuracy on out-of-sample data',
  },
]

function initialExperiments(): SavedExperiment[] {
  try {
    const loaded = loadExperiments()
    if (loaded.length > 0) return loaded
  } catch {
    /* localStorage blocked or corrupt */
  }
  return SEED_EXPERIMENTS
}

class ExperimentsErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { err: Error | null }> {
  state: { err: Error | null } = { err: null }

  static getDerivedStateFromError(err: Error) {
    return { err }
  }

  render() {
    if (this.state.err) return this.props.fallback
    return this.props.children
  }
}

const card = 'rounded-xl border border-white/[0.08] bg-[#12121A] p-4'

export default function ExperimentsPage() {
  const nav = useNavigate()
  const [list, setList] = useState<SavedExperiment[]>(initialExperiments)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [fStrategy, setFStrategy] = useState('All')
  const [fIndex, setFIndex] = useState('All')
  const [highlightId, setHighlightId] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (loadExperiments().length === 0) {
        saveExperiments(SEED_EXPERIMENTS)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const filtered = useMemo(() => {
    const safe = Array.isArray(list) ? list : []
    return safe.filter((e) => {
      if (!e || typeof e.name !== 'string') return false
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
      if (fStrategy !== 'All' && !(e.strategies ?? []).includes(fStrategy)) return false
      if (fIndex !== 'All' && normalizedIndexLabel(e.indexLabel) !== fIndex) return false
      return true
    })
  }, [list, search, fStrategy, fIndex])

  const bars = useMemo(
    () =>
      filtered.map((e) => ({
        id: e.id,
        label: e.name.slice(0, 10),
        height: Math.max(5, Number(e.bestReturnPct) || 0),
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

  const refresh = useCallback(() => {
    try {
      setList(loadExperiments())
    } catch {
      setList(SEED_EXPERIMENTS)
    }
  }, [])

  const safeList = Array.isArray(list) ? list : []

  const emptyState = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        gap: 16,
      }}
    >
      <p style={{ color: '#888', fontSize: 16 }}>No experiments yet. Go to Research Lab to run your first experiment.</p>
      <button
        type="button"
        onClick={() => nav('/student/research-lab')}
        style={{
          background: '#7C3AED',
          color: '#fff',
          border: 'none',
          padding: '10px 24px',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        Go to Research Lab
      </button>
    </div>
  )

  const noMatches = (
    <div className={`${card} text-center text-sm text-white/50`}>No experiments match your filters. Try clearing search or filters.</div>
  )

  return (
    <ExperimentsErrorBoundary
      fallback={
        <div className="space-y-4 p-4">
          <h1 className="text-2xl font-semibold text-white">My Research Experiments</h1>
          <div className={card}>
            <p className="text-sm text-white/60">Something went wrong loading this page. You can still open the research lab.</p>
            <button
              type="button"
              className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm text-white"
              onClick={() => nav('/student/research-lab')}
            >
              Go to Research Lab
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">My Research Experiments</h1>
          <p className="mt-1 text-sm text-white/55">Saved runs from the research lab and class assignments.</p>
        </div>

        <WebGLGate
          fallback={
            <div className="h-[120px] rounded-xl border border-dashed border-white/15 bg-black/30 p-4 text-sm text-white/45">
              3D view needs WebGL.
            </div>
          }
        >
          <ExperimentsErrorBoundary
            fallback={
              <div className="h-[120px] rounded-xl border border-dashed border-white/15 bg-black/30 p-4 text-sm text-white/45">
                3D preview unavailable.
              </div>
            }
          >
            <ExperimentsBars3D bars={bars} selectedId={highlightId} onSelect={(id) => setHighlightId(id)} />
          </ExperimentsErrorBoundary>
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
            <option>Regime_Aware_v3</option>
            <option>Buy_Hold</option>
          </select>
          <select
            className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
            value={fIndex}
            onChange={(e) => setFIndex(e.target.value)}
          >
            <option>All</option>
            <option>NIFTY 50</option>
            <option>S&amp;P 500</option>
            <option>Both</option>
          </select>
        </div>

        {safeList.length === 0 ? emptyState : filtered.length === 0 ? noMatches : null}

        {safeList.length > 0 && filtered.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((e) => (
              <div key={e.id} className={`${card} ${highlightId === e.id ? 'ring-1 ring-violet-500/50' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-lg font-bold text-white">{e.name}</div>
                    <div className="text-xs text-white/45">{new Date(e.runAt).toLocaleString()}</div>
                  </div>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/60">{e.indexLabel}</span>
                </div>
                <div className="mt-2 text-xs text-white/50">{(e.strategies ?? []).join(', ')}</div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <span className="text-emerald-400">Best return: {Number(e.bestReturnPct).toFixed(2)}%</span>
                  <span className="text-white/70">Best Sharpe: {Number(e.bestSharpe).toFixed(2)}</span>
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
                    <StrategyTable
                      title="Snapshot metrics (illustrative)"
                      rows={mockTableRows as any}
                      columns={buildStrategyTableColumns(mockTableRows[0])}
                    />
                    <div style={{ width: '100%', height: 300, minWidth: 0, minHeight: 0 }}>
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
        ) : null}
      </div>
    </ExperimentsErrorBoundary>
  )
}
