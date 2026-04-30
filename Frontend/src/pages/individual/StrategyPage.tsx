import { useMemo } from 'react'
import { Crown } from 'lucide-react'
import StrategyComparisonChart from '../../components/charts/StrategyComparisonChart'
import LazyQuantWiseCandlestickChart from '../../components/charts/LazyQuantWiseCandlestickChart'
import { useRegime } from '../../hooks/useRegime'
import { regimeAccent } from '../../lib/regimeChartStyle'
import { useBacktest } from '../../hooks/useBacktest'
import { useEffect, useState } from 'react'

const inputCls =
  'mt-2 rounded-lg border border-[rgba(255,255,255,0.12)] bg-zinc-950 px-3 py-2.5 text-sm text-white shadow-inner [color-scheme:dark] outline-none focus:border-violet-500/60'

export default function IndividualStrategyPage() {
  const { data } = useRegime()
  const regimes = useMemo(() => {
    const d = data as { nifty?: { regime?: string }; sp500?: { regime?: string } } | undefined
    return {
      nifty: String(d?.nifty?.regime ?? 'Strong Bull'),
      sp500: String(d?.sp500?.regime ?? 'Weak Sideways'),
    }
  }, [data])

  const mutation = useBacktest()

  const [startDate, setStartDate] = useState('2000-01-01')
  const [endDate, setEndDate] = useState('2026-01-01')
  const [result, setResult] = useState<any>(null)

  const handleRun = () => {
    mutation.mutate({ start_date: startDate, end_date: endDate, initial_capital: 1000000 }, {
      onSuccess: (data) => setResult(data)
    })
  }

  // Auto run once
  useEffect(() => {
    handleRun()
  }, [])

  const { strategyStats, keys, winners } = useMemo(() => {
    if (!result?.backtests?.nifty) return { strategyStats: {}, keys: [], winners: {} }
    
    const records = result.backtests.nifty as Array<Record<string, any>>
    const stats: Record<string, any> = {}
    
    let bestFinalStr = ''
    let bestFinal = -Infinity
    let bestAnnStr = ''
    let bestAnn = -Infinity
    let bestSharpeStr = ''
    let bestSharpe = -Infinity

    for (const r of records) {
      const name = r.Strategy
      if (!name || name === 'All') continue
      
      const finalValStr = Object.keys(r).find(k => k.startsWith('Final Value'))
      let fv = 0
      if (finalValStr && r[finalValStr] && typeof r[finalValStr] === 'string') {
        fv = Number(r[finalValStr].replace(/[^0-9.-]+/g,""))
      }
      
      const ann = Number(r['Ann. Return (%)']) || 0
      const sharpe = Number(r['Sharpe Ratio']) || 0
      
      stats[name] = { final: fv, ann, sharpe }
      
      if (fv > bestFinal) { bestFinal = fv; bestFinalStr = name; }
      if (ann > bestAnn) { bestAnn = ann; bestAnnStr = name; }
      if (sharpe > bestSharpe) { bestSharpe = sharpe; bestSharpeStr = name; }
    }
    
    return { 
      strategyStats: stats, 
      keys: Object.keys(stats).filter(k => ['Combined_v3', 'ML_Signal', 'Regime_Aware_v3', 'Buy_Hold'].includes(k)),
      winners: { bestFinal: bestFinalStr, bestAnn: bestAnnStr, bestSharpe: bestSharpeStr } 
    }
  }, [result])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Strategy comparison</h1>
        <p className="mt-1 text-sm text-white/60">
          Four equity curves with actual simulated wealth aligned to research outputs based on your dates.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5">
        <label className="flex flex-col text-sm font-medium text-white/75">
          Start date
          <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="flex flex-col text-sm font-medium text-white/75">
          End date
          <input type="date" className={inputCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button
          type="button"
          onClick={handleRun}
          disabled={mutation.isPending}
          className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60"
        >
          {mutation.isPending ? 'Calculating...' : 'Update Strategies'}
        </button>
      </div>

      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5 shadow-glow">
        <div className="text-sm font-semibold text-white">Current market state</div>
        <p className="mt-1 text-xs text-white/50">Live demo candles with regime badges from the ML service.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <div
              className="mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: `${regimeAccent(regimes.nifty)}22`,
                color: regimeAccent(regimes.nifty),
                border: `1px solid ${regimeAccent(regimes.nifty)}55`,
              }}
            >
              {regimes.nifty}
            </div>
            <LazyQuantWiseCandlestickChart symbol="NIFTY50" symbolLabel="NIFTY 50" interval="5m" height={350} dataSource="yfinance" />
          </div>
          <div>
            <div
              className="mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: `${regimeAccent(regimes.sp500)}22`,
                color: regimeAccent(regimes.sp500),
                border: `1px solid ${regimeAccent(regimes.sp500)}55`,
              }}
            >
              {regimes.sp500}
            </div>
            <LazyQuantWiseCandlestickChart symbol="SP500" symbolLabel="S&P 500" interval="5m" height={350} dataSource="yfinance" />
          </div>
        </div>
      </div>

      <StrategyComparisonChart height={300} />

      <div className="grid gap-4 md:grid-cols-3">
        {keys.map((k) => (
          <div key={k} className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-white/90">{k}</div>
              {k === 'Combined_v3' ? <span className="text-xs text-violet-300/90">Primary</span> : null}
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/55">Final value</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-white">
                  Rs {strategyStats[k]?.final?.toLocaleString('en-IN') ?? '---'}
                  {winners.bestFinal === k ? <Crown className="size-4 text-amber-400" /> : null}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/55">Ann. return</span>
                <span className="inline-flex items-center gap-1.5 text-white">
                  {strategyStats[k]?.ann?.toFixed(2) ?? '---'}%
                  {winners.bestAnn === k ? <Crown className="size-4 text-amber-400" /> : null}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/55">Sharpe</span>
                <span className="inline-flex items-center gap-1.5 text-white">
                  {strategyStats[k]?.sharpe?.toFixed(2) ?? '---'}
                  {winners.bestSharpe === k ? <Crown className="size-4 text-amber-400" /> : null}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-5">
        <div className="text-sm font-semibold text-violet-200">Takeaway</div>
        <p className="mt-2 text-sm text-white/75">
          Combined_v3 leads on terminal wealth and risk-adjusted metrics in this mock snapshot; Buy &amp; Hold remains the
          transparent benchmark.
        </p>
      </div>
    </div>
  )
}
