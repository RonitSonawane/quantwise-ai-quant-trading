import { useMemo } from 'react'
import { Crown } from 'lucide-react'
import StrategyComparisonChart from '../../components/charts/StrategyComparisonChart'
import { STRATEGY_FINAL_RS, type StrategyKey } from '../../lib/strategyEquityMock'

const ANN = { Combined_v3: 39.91, ML_Signal: 36.33, Regime_Aware_v3: 34.64, Buy_Hold: 10.39 } as const
const SHARPE = { Combined_v3: 1.65, ML_Signal: 1.52, Regime_Aware_v3: 1.47, Buy_Hold: 0.85 } as const

const keys = Object.keys(STRATEGY_FINAL_RS) as StrategyKey[]

export default function IndividualStrategyPage() {
  const winners = useMemo(() => {
    const bestFinal = keys.reduce((a, b) => (STRATEGY_FINAL_RS[a] >= STRATEGY_FINAL_RS[b] ? a : b))
    const bestAnn = 'Combined_v3' as StrategyKey
    const bestSharpe = 'Combined_v3' as StrategyKey
    return { bestFinal, bestAnn, bestSharpe }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Strategy comparison</h1>
        <p className="mt-1 text-sm text-white/60">
          Four equity curves with mock terminal wealth aligned to research outputs (10L base).
        </p>
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
                  Rs {STRATEGY_FINAL_RS[k].toLocaleString('en-IN')}
                  {winners.bestFinal === k ? <Crown className="size-4 text-amber-400" /> : null}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/55">Ann. return (mock)</span>
                <span className="inline-flex items-center gap-1.5 text-white">
                  {ANN[k].toFixed(2)}%
                  {winners.bestAnn === k ? <Crown className="size-4 text-amber-400" /> : null}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/55">Sharpe (mock)</span>
                <span className="inline-flex items-center gap-1.5 text-white">
                  {SHARPE[k].toFixed(2)}
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
