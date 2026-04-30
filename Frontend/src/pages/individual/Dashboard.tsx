import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getLiveSignal } from '../../api/paperTrading'
import { simulateInvestment } from '../../api/simulate'
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
  { key: 'nifty' as const, label: 'NIFTY 50', symbol: 'NIFTY50', symLabel: 'NIFTY 50 (Live Demo)' },
  { key: 'sp' as const, label: 'S&P 500', symbol: 'SP500', symLabel: 'S&P 500 (Live Demo)' },
  { key: 'sensex' as const, label: 'SENSEX', symbol: 'SENSEX', symLabel: 'SENSEX (Live Demo)' },
]

function TodaySignalPreview() {
  const { data, isLoading } = useQuery({
    queryKey: ['live-signal-nifty'],
    queryFn: () => getLiveSignal('NIFTY50'),
    refetchInterval: 300000
  })

  if (isLoading) return <CardSkeleton />
  if (!data) return <div className="text-sm text-white/50">Failed to load signal</div>

  return (
    <div className="flex items-center gap-8 rounded-xl bg-black/20 p-5 border border-[rgba(255,255,255,0.05)]">
      <div className="flex flex-col">
        <span className="text-sm text-white/50">Index</span>
        <span className="font-bold text-white">NIFTY 50</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-white/50">Direction</span>
        <span className={`font-bold ${data.direction === 'BUY' ? 'text-green-500' : data.direction === 'REDUCE' ? 'text-red-500' : 'text-yellow-500'}`}>{data.direction}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-white/50">Confidence</span>
        <span className="font-bold text-white">{data.combined_score}%</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-white/50">Risk Level</span>
        <span className={`font-bold ${data.risk_level === 'LOW' ? 'text-green-500' : data.risk_level === 'MEDIUM' ? 'text-yellow-500' : 'text-red-500'}`}>{data.risk_level}</span>
      </div>
    </div>
  )
}


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

  const simStartDate = '2025-01-01';
  const simEndDate = '2026-01-01';

  const { data: simulationData } = useQuery({
    queryKey: ['dashboard-simulation', 'nifty', 'Combined_v3', simStartDate, simEndDate],
    queryFn: () => simulateInvestment({
      asset: 'nifty',
      strategy: 'Combined_v3',
      initial_capital: 100000,
      start_date: simStartDate,
      end_date: simEndDate,
    })
  });

  const equityCurve = useMemo(() => {
    if (simulationData?.result?.equity_curve) {
      return (simulationData.result.equity_curve as any[]).map(p => ({
        date: p.date,
        value: Number(p.value)
      }));
    }
    return [{ date: simStartDate, value: 100000 }];
  }, [simulationData]);

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
          <p className="mt-1 text-sm text-white/55">Actual curve from Rs 1,00,000 via Combined_v3 strategy (2025-2026).</p>
          <div className="mt-4">
            <EquityCurveChart data={equityCurve} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-glow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-semibold text-white">Today's Trading Signal</div>
            <p className="mt-1 text-sm text-white/55">Live signal preview for NIFTY 50 from Paper Trading Engine.</p>
          </div>
          <Link to="/individual/paper-trading" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700">
            View Full Signal
          </Link>
        </div>
        <TodaySignalPreview />
      </div>

      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-glow">
        <div className="text-lg font-semibold text-white">Live market charts</div>
        <p className="mt-1 text-sm text-white/55">Real-time authentic index candles from Yahoo Finance.</p>
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
            dataSource="yfinance"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Portfolio value" value={`Rs ${equityCurve[equityCurve.length - 1]?.value.toLocaleString('en-IN')}`} sub="Initial Rs 1,00,000" trend="up" />
        <MetricCard label="Total return" value={`${(((equityCurve[equityCurve.length - 1]?.value / 100000) - 1) * 100).toFixed(2)}%`} sub="2025-2026" trend="up" />
        <MetricCard label="Sharpe ratio" value={(simulationData?.result?.sharpe_ratio as string | undefined) ?? '0.0'} sub="Risk-adjusted" trend="up" />
        <MetricCard label="Max drawdown" value={`${(simulationData?.result?.max_drawdown_pct as string | undefined) ?? '0'}%`} sub="Worst dip" trend="down" />
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
