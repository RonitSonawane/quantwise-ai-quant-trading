import { useMemo, useState } from 'react'
import { Activity, BarChart3, BrainCircuit } from 'lucide-react'
import EquityCurveChart from '../../components/charts/EquityCurveChart'
import LiveIndexCard from '../../components/charts/LiveIndexCard'
import LazyQuantWiseCandlestickChart from '../../components/charts/LazyQuantWiseCandlestickChart'
import RegimeBadge from '../../components/dashboard/RegimeBadge'
import MetricCard from '../../components/dashboard/MetricCard'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { useRegime } from '../../hooks/useRegime'

function regimePanelBorder(regime: string) {
  const l = regime.toLowerCase()
  if (l.includes('strong') && l.includes('bull')) return 'border-l-emerald-500'
  if (l.includes('strong') && l.includes('bear')) return 'border-l-red-500'
  if (l.includes('weak') && l.includes('sideways')) return 'border-l-yellow-400'
  if (l.includes('bull')) return 'border-l-emerald-400/80'
  if (l.includes('bear')) return 'border-l-red-400/80'
  return 'border-l-violet-500/60'
}

const liveTabs = [
  { key: 'nifty' as const, label: 'NIFTY 50', symbol: 'BTCUSDT', symLabel: 'NIFTY 50 (Live Demo)' },
  { key: 'sp' as const, label: 'S&P 500', symbol: 'ETHUSDT', symLabel: 'S&P 500 (Live Demo)' },
  { key: 'sensex' as const, label: 'SENSEX', symbol: 'BNBUSDT', symLabel: 'SENSEX (Live Demo)' },
]

export default function IndividualDashboard() {
  const { data, isLoading } = useRegime()
  const [liveTab, setLiveTab] = useState<(typeof liveTabs)[number]['key']>('nifty')
  const [liveIv, setLiveIv] = useState<'1m' | '5m' | '15m' | '1h'>('5m')

  const regime = useMemo(() => {
    const d = data as { nifty?: { regime?: string }; sp500?: { regime?: string } } | undefined
    return {
      nifty: String(d?.nifty?.regime ?? 'Strong Bull'),
      sp500: String(d?.sp500?.regime ?? 'Weak Sideways'),
    }
  }, [data])

  const mockEquity = useMemo(
    () =>
      Array.from({ length: 31 }).map((_, i) => {
        const d = new Date(2025, 0, 1 + i)
        const value = 100000 + (15000 * i) / 30
        return { date: d.toISOString().slice(0, 10), value }
      }),
    [],
  )

  const live = useMemo(
    () => [
      { name: 'NIFTY 50', value: 24832, changePct: 0.43 },
      { name: 'SENSEX', value: 81765, changePct: 0.38 },
      { name: 'S&P 500', value: 5892, changePct: 0.21 },
    ],
    [],
  )

  const activeLive = liveTabs.find((t) => t.key === liveTab) ?? liveTabs[0]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>

      <div className="grid w-full gap-4 md:grid-cols-3">
        {live.map((l) => (
          <LiveIndexCard key={l.name} name={l.name} value={l.value} changePct={l.changePct} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div
          className={`rounded-xl border border-[rgba(255,255,255,0.08)] border-l-4 bg-[rgba(255,255,255,0.03)] p-6 shadow-glow ${regimePanelBorder(regime.nifty)}`}
        >
          <div className="text-lg font-semibold text-white">Current regime</div>
          <p className="mt-1 text-sm text-white/55">Live HMM label (updates with the ML service).</p>
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <RegimeBadge regime={regime.nifty} pulse />
                <span className="text-sm text-white/50">NIFTY 50</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <RegimeBadge regime={regime.sp500} />
                <span className="text-sm text-white/50">S&amp;P 500</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-glow">
          <div className="text-lg font-semibold text-white">Portfolio equity</div>
          <p className="mt-1 text-sm text-white/55">Mock curve from Rs 1,00,000 → Rs 1,15,000.</p>
          <div className="mt-4">
            <EquityCurveChart data={mockEquity} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-glow">
        <div className="text-lg font-semibold text-white">Live market charts</div>
        <p className="mt-1 text-sm text-white/55">Real-time proxy candles (Binance) mapped to each index for the demo.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {liveTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setLiveTab(t.key)}
              className={`rounded-lg px-4 py-2 text-sm ${
                liveTab === t.key ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(['1m', '5m', '15m', '1h'] as const).map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => setLiveIv(iv)}
              className={`rounded-lg px-3 py-1.5 text-xs ${
                liveIv === iv ? 'bg-violet-600/90 text-white' : 'bg-white/5 text-white/60'
              }`}
            >
              {iv}
            </button>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.06] bg-black/25">
          <LazyQuantWiseCandlestickChart
            key={`${activeLive.symbol}-${liveIv}`}
            symbol={activeLive.symbol}
            symbolLabel={activeLive.symLabel}
            interval={liveIv}
            height={350}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Portfolio value" value="Rs 1,15,000" sub="Initial Rs 1,00,000" trend="up" />
        <MetricCard label="Total return" value="+15.00%" sub="Last 30 days (mock)" trend="up" />
        <MetricCard label="Sharpe ratio" value="1.42" sub="Risk-adjusted (mock)" trend="up" />
        <MetricCard label="Max drawdown" value="-4.8%" sub="Worst dip (mock)" trend="down" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-glow lg:col-span-2">
          <div className="text-lg font-semibold text-white">Recent activity</div>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-black/20 px-4 py-3">
              <BarChart3 className="mt-0.5 size-5 shrink-0 text-violet-400" />
              <div className="min-w-0 flex-1 text-sm text-white/75">
                Backtest run: <span className="font-semibold text-white">Combined_v3</span> • NIFTY 50
              </div>
              <span className="shrink-0 text-xs text-white/40">2h ago</span>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-black/20 px-4 py-3">
              <BrainCircuit className="mt-0.5 size-5 shrink-0 text-emerald-400" />
              <div className="min-w-0 flex-1 text-sm text-white/75">
                Regime update: <span className="font-semibold text-white">{regime.nifty}</span>
              </div>
              <span className="shrink-0 text-xs text-white/40">Today</span>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-black/20 px-4 py-3">
              <Activity className="mt-0.5 size-5 shrink-0 text-sky-400" />
              <div className="min-w-0 flex-1 text-sm text-white/75">ML ensemble recomputed • test accuracy ~66% (mock)</div>
              <span className="shrink-0 text-xs text-white/40">Yesterday</span>
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-glow">
          <div className="text-lg font-semibold text-white">Next actions</div>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Run a full <span className="text-white/85">Backtest</span> for the pipeline, open{' '}
            <span className="text-white/85">Simulation</span> for growth projection, or review{' '}
            <span className="text-white/85">Strategies</span> for curve comparison.
          </p>
        </div>
      </div>
    </div>
  )
}
