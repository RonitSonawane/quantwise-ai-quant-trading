import { useMemo } from 'react'
import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts'
import { useRegime } from '../../hooks/useRegime'
import RegimeBadge from '../../components/dashboard/RegimeBadge'

type RegimeExplanation = { title: string; body: string; recommended: string }

const explanationMap: Record<string, RegimeExplanation> = {
  'Strong Bull': { title: 'Strong Bull', body: 'Market trending up strongly with high confidence. Consider full investment.', recommended: 'Combined_v3' },
  'Weak Bull': { title: 'Weak Bull', body: 'Uptrend is present but not dominant. Consider moderate exposure.', recommended: 'ML_Signal' },
  'Strong Sideways': { title: 'Strong Sideways', body: 'Return is near-neutral; volatility is supportive. Use balanced strategies.', recommended: 'Regime_Aware_v3' },
  'Weak Sideways': { title: 'Weak Sideways', body: 'Choppy market with low directional edge. Reduce risk and stay adaptive.', recommended: 'ML_Signal' },
  'Weak Bear': { title: 'Weak Bear', body: 'Downside pressure is mild. Consider defense-focused allocation.', recommended: 'Regime_Aware_v3' },
  'Strong Bear': { title: 'Strong Bear', body: 'Crash-like conditions. Reduce exposure and prioritize capital protection.', recommended: 'Buy_Hold' },
}

export default function IndividualRegimePage() {
  const { data, isLoading } = useRegime()

  const regimes = useMemo(() => {
    const d = data as any
    return {
      nifty: String(d?.nifty?.regime ?? 'Strong Bull'),
      sp500: String(d?.sp500?.regime ?? 'Weak Sideways'),
    }
  }, [data])

  const recommended = useMemo(() => {
    const r = regimes.nifty
    return explanationMap[r]?.recommended ?? 'Combined_v3'
  }, [regimes.nifty])

  const pieData = useMemo(
    () => [
      { name: 'Strong Bull', value: 28 },
      { name: 'Weak Bull', value: 18 },
      { name: 'Strong Sideways', value: 22 },
      { name: 'Weak Sideways', value: 17 },
      { name: 'Weak Bear', value: 9 },
      { name: 'Strong Bear', value: 6 },
    ],
    [],
  )

  const colors = ['#1a7a1a', '#6dbf6d', '#e6a817', '#f0d080', '#e07050', '#c0392b']

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white/90">Regime Detection</h1>
              <p className="mt-1 text-sm text-white/60">HMM regimes with finance-theory labeling (mock history).</p>
            </div>
            <div className="text-sm text-white/60">{isLoading ? 'Fetching…' : 'Updated'}</div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <RegimeBadge regime={regimes.nifty} />
            <RegimeBadge regime={regimes.sp500} />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold text-white/85">Recommended Strategy</div>
            <div className="mt-2 text-2xl font-semibold text-purple-300">{recommended}</div>
            <div className="mt-2 text-sm text-white/60">{explanationMap[regimes.nifty]?.body}</div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold text-white/80">Regime History (Mock)</div>
              <div className="mt-3 h-[140px] rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-3 text-sm text-white/70 flex items-center">
                Colored regime bands over time chart goes here.
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold text-white/80">Regime Distribution</div>
              <div className="mt-3 h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={35} outerRadius={55} paddingAngle={2}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={colors[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-white/60">Based on training distribution (mock).</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow">
          <h2 className="text-sm font-semibold text-white/85">What This Means</h2>
          <div className="mt-3 space-y-3 text-sm text-white/70">
            {Object.keys(explanationMap).map((k) => (
              <div key={k}>
                <div className="text-white/90 font-semibold">{k}</div>
                <div className="mt-1">{explanationMap[k].body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

