import { useCallback, useMemo, useRef, useState } from 'react'
import { Trophy } from 'lucide-react'
import type { IChartApi } from 'lightweight-charts'
import LiveIndexBanner from '../../components/landing/LiveIndexBanner'
import WebGLGate from '../../components/layout/WebGLGate'
import MarketGlobe3D from '../../components/3d/MarketGlobe3D'
import { useRegime } from '../../hooks/useRegime'
import ApiMockBadge from '../../components/ui/ApiMockBadge'
import LazyQuantWiseCandlestickChart from '../../components/charts/LazyQuantWiseCandlestickChart'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from 'recharts'

const card = 'rounded-xl border border-white/[0.08] bg-[#12121A] p-4'

const leaderboard = [
  { rank: 1, strategy: 'Combined_v3', ann: 39.91, sharpe: 1.65, status: 'Active' },
  { rank: 2, strategy: 'ML_Signal', ann: 36.33, sharpe: 1.52, status: 'Active' },
  { rank: 3, strategy: 'Regime_Aware_v3', ann: 34.64, sharpe: 1.47, status: 'Active' },
  { rank: 4, strategy: 'Dual_Momentum', ann: 22.1, sharpe: 1.12, status: 'Watch' },
  { rank: 5, strategy: 'MTM', ann: 21.4, sharpe: 1.08, status: 'Watch' },
]

const corr = ['Combined_v3', 'ML_Signal', 'Regime_Aware_v3', 'Buy_Hold']
const corrMatrix: number[][] = [
  [1, 0.72, 0.68, 0.41],
  [0.72, 1, 0.75, 0.38],
  [0.68, 0.75, 1, 0.44],
  [0.41, 0.38, 0.44, 1],
]

function heatColor(v: number) {
  if (v >= 0.85) return 'bg-emerald-500/50'
  if (v >= 0.55) return 'bg-violet-500/40'
  if (v >= 0.35) return 'bg-amber-500/35'
  return 'bg-slate-600/40'
}

export default function OrganizationDashboard() {
  const [liveTab, setLiveTab] = useState<'nifty' | 'sp500'>('nifty')
  const chartApiRef = useRef<IChartApi | null>(null)
  const { data: regimeData, isError: regimeErr } = useRegime()

  const onChartReady = useCallback((c: IChartApi) => {
    chartApiRef.current = c
  }, [])

  const handleExportChart = useCallback(() => {
    const c = chartApiRef.current
    if (!c) return
    const canvas = c.takeScreenshot()
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `quantwise-${liveTab}.png`
    a.click()
  }, [liveTab])

  const rollSharpe = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        x: i,
        a: 0.9 + Math.sin(i / 5) * 0.15,
        b: 0.75 + Math.cos(i / 4) * 0.12,
        c: 0.65 + Math.sin(i / 6) * 0.1,
      })),
    [],
  )

  const regimes = regimeData as { nifty?: { regime?: string }; sp500?: { regime?: string } } | undefined

  return (
    <div className="space-y-6">
      <LiveIndexBanner />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Executive dashboard</h1>
          <p className="mt-1 text-sm text-white/55">Cross-index signals, leadership board, and risk posture.</p>
        </div>
        <div className="flex items-center gap-2">
          <ApiMockBadge show={regimeErr} />
          <WebGLGate fallback={null}>
            <MarketGlobe3D />
          </WebGLGate>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className={card}>
          <div className="text-xs text-white/45">NIFTY current regime</div>
          <div className="mt-2 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-200">
            {String(regimes?.nifty?.regime ?? 'Strong Bull')}
          </div>
        </div>
        <div className={card}>
          <div className="text-xs text-white/45">S&amp;P 500 current regime</div>
          <div className="mt-2 inline-flex rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-sm font-semibold text-amber-100">
            {String(regimes?.sp500?.regime ?? 'Weak Sideways')}
          </div>
        </div>
        <div className={card}>
          <div className="text-xs text-white/45">Best strategy YTD (mock)</div>
          <div className="mt-2 text-lg font-semibold text-violet-300">Combined_v3 +39.91%</div>
        </div>
        <div className={card}>
          <div className="text-xs text-white/45">Portfolio under analysis</div>
          <div className="mt-2 text-lg font-semibold text-white">Rs 10,00,00,000</div>
        </div>
        <div className={card}>
          <div className="text-xs text-white/45">Active strategies</div>
          <div className="mt-2 text-lg font-semibold text-white">15</div>
        </div>
        <div className={card}>
          <div className="text-xs text-white/45">ML model accuracy</div>
          <div className="mt-2 text-lg font-semibold text-white">54.2%</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={card}>
          <h2 className="text-lg font-semibold text-white">Strategy leaderboard</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/45">
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">Strategy</th>
                  <th className="pb-2">Ann %</th>
                  <th className="pb-2">Sharpe</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((r) => (
                  <tr key={r.strategy} className="border-b border-white/[0.06]">
                    <td className="py-2">
                      {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}
                    </td>
                    <td className="py-2 font-medium text-white">{r.strategy}</td>
                    <td className="py-2">{r.ann.toFixed(2)}</td>
                    <td className="py-2">{r.sharpe.toFixed(2)}</td>
                    <td className="py-2 text-white/55">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">Live index proxies</h2>
            <button
              type="button"
              onClick={handleExportChart}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
            >
              Export chart
            </button>
          </div>
          <p className="mt-1 text-xs text-white/45">Live candlesticks (Binance proxy). Toggle index, export PNG snapshot.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLiveTab('nifty')}
              className={`rounded-lg px-3 py-1.5 text-xs ${liveTab === 'nifty' ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/65'}`}
            >
              NIFTY 50
            </button>
            <button
              type="button"
              onClick={() => setLiveTab('sp500')}
              className={`rounded-lg px-3 py-1.5 text-xs ${liveTab === 'sp500' ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/65'}`}
            >
              S&amp;P 500
            </button>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.06] bg-black/30">
            <LazyQuantWiseCandlestickChart
              key={liveTab}
              symbol={liveTab === 'nifty' ? 'BTCUSDT' : 'ETHUSDT'}
              symbolLabel={liveTab === 'nifty' ? 'NIFTY 50 (Live Demo)' : 'S&P 500 (Live Demo)'}
              interval="5m"
              height={350}
              onChartReady={onChartReady}
            />
          </div>
        </div>

        <div className={card}>
          <h2 className="text-lg font-semibold text-white">Risk alerts</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="border-l-4 border-emerald-500 bg-emerald-500/10 py-2 pl-3 text-white/80">
              NIFTY Sharpe above 0.8 — healthy
            </li>
            <li className="border-l-4 border-amber-400 bg-amber-500/10 py-2 pl-3 text-white/80">
              S&amp;P 500 in Weak Sideways — monitor
            </li>
            <li className="border-l-4 border-red-500 bg-red-500/10 py-2 pl-3 text-white/80">
              Max drawdown approaching -15% threshold on sleeve B
            </li>
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={card}>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Trophy className="size-5 text-amber-400" />
            Strategy correlation (mock)
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-1" />
                  {corr.map((c) => (
                    <th key={c} className="max-w-[72px] truncate p-1 text-left text-white/50">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {corrMatrix.map((row, i) => (
                  <tr key={i}>
                    <td className="max-w-[100px] truncate p-1 font-medium text-white/70">{corr[i]}</td>
                    {row.map((v, j) => (
                      <td key={j} className="p-1">
                        <div className={`flex h-10 w-full items-center justify-center rounded ${heatColor(v)} text-white`}>
                          {v.toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={card}>
          <h2 className="text-lg font-semibold text-white">Rolling 60d Sharpe (mock)</h2>
          <div style={{ width: '100%', height: 300, minWidth: 0, minHeight: 0 }} className="mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rollSharpe} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="x" tick={false} />
                <YAxis width={36} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0b0b12', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Legend />
                <Line dataKey="a" stroke="#7c3aed" dot={false} name="Combined_v3" />
                <Line dataKey="b" stroke="#0d9488" dot={false} name="ML_Signal" />
                <Line dataKey="c" stroke="#2563eb" dot={false} name="Regime_Aware_v3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
