import { useMemo } from 'react'
import { Pie, PieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useRegime } from '../../hooks/useRegime'
import RegimeBadge from '../../components/dashboard/RegimeBadge'
import { CardSkeleton } from '../../components/ui/Skeleton'

type RegimeExplanation = { title: string; body: string; recommended: string }

const explanationMap: Record<string, RegimeExplanation> = {
  'Strong Bull': {
    title: 'Strong Bull',
    body: 'Market trending up strongly with high confidence. Consider full investment.',
    recommended: 'Combined_v3',
  },
  'Weak Bull': {
    title: 'Weak Bull',
    body: 'Uptrend is present but not dominant. Consider moderate exposure.',
    recommended: 'ML_Signal',
  },
  'Strong Sideways': {
    title: 'Strong Sideways',
    body: 'Return is near-neutral; volatility is supportive. Use balanced strategies.',
    recommended: 'Regime_Aware_v3',
  },
  'Weak Sideways': {
    title: 'Weak Sideways',
    body: 'Choppy market with low directional edge. Reduce risk and stay adaptive.',
    recommended: 'ML_Signal',
  },
  'Weak Bear': {
    title: 'Weak Bear',
    body: 'Downside pressure is mild. Consider defense-focused allocation.',
    recommended: 'Regime_Aware_v3',
  },
  'Strong Bear': {
    title: 'Strong Bear',
    body: 'Crash-like conditions. Reduce exposure and prioritize capital protection.',
    recommended: 'Buy_Hold',
  },
}

const REGIME_COLORS: Record<number, string> = {
  1: '#1a7a1a',
  2: '#6dbf6d',
  3: '#e6a817',
  4: '#f0d080',
  5: '#e07050',
  6: '#c0392b',
}

const REGIME_LABELS: Record<number, string> = {
  1: 'Strong Bull',
  2: 'Weak Bull',
  3: 'Strong Sideways',
  4: 'Weak Sideways',
  5: 'Weak Bear',
  6: 'Strong Bear',
}

const probMock = [
  { name: 'Strong Bull', pct: 60, fill: '#1a7a1a' },
  { name: 'Weak Bull', pct: 20, fill: '#6dbf6d' },
  { name: 'Strong Sideways', pct: 8, fill: '#e6a817' },
  { name: 'Weak Sideways', pct: 6, fill: '#f0d080' },
  { name: 'Weak Bear', pct: 4, fill: '#e07050' },
  { name: 'Strong Bear', pct: 2, fill: '#c0392b' },
]

export default function IndividualRegimePage() {
  const { data, isLoading } = useRegime()

  const regimes = useMemo(() => {
    const d = data as { nifty?: { regime?: string }; sp500?: { regime?: string } } | undefined
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

  const regimeHistory = useMemo(() => {
    return Array.from({ length: 48 }).map((_, i) => {
      const day = 1 + (i % 28)
      const month = 1 + Math.floor(i / 28)
      const r = 1 + ((i * 7) % 6)
      return {
        date: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        regime: r,
        label: REGIME_LABELS[r],
        fill: REGIME_COLORS[r],
      }
    })
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-white">Regime detection</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-glow lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/60">HMM regimes with finance-theory labeling (history mock).</p>
            </div>
            <div className="text-sm text-white/50">{isLoading ? 'Fetching…' : 'Updated'}</div>
          </div>

          {isLoading ? (
            <CardSkeleton />
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <RegimeBadge regime={regimes.nifty} pulse />
              <RegimeBadge regime={regimes.sp500} />
            </div>
          )}

          <div className="mt-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-black/25 p-4">
            <div className="text-sm font-semibold text-white/85">Recommended strategy</div>
            <div className="mt-2 text-2xl font-semibold text-violet-300">{recommended}</div>
            <div className="mt-2 text-sm text-white/60">{explanationMap[regimes.nifty]?.body}</div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-black/20 p-4">
              <div className="text-sm font-semibold text-white/85">Regime history (mock)</div>
              <div style={{ width: '100%', height: 300 }} className="mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regimeHistory} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} interval={6} />
                    <YAxis
                      domain={[1, 6]}
                      ticks={[1, 2, 3, 4, 5, 6]}
                      tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                      label={{ value: 'Regime (1–6)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0b0b12',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 12,
                      }}
                      formatter={(v) => [REGIME_LABELS[Number(v ?? 0)] ?? String(v ?? ''), 'Regime']}
                    />
                    <Bar dataKey="regime" radius={[2, 2, 0, 0]}>
                      {regimeHistory.map((e, i) => (
                        <Cell key={`c-${i}`} fill={e.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-black/20 p-4">
              <div className="text-sm font-semibold text-white/85">Regime distribution</div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={40} outerRadius={72} paddingAngle={2}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={colors[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-white/50">Training distribution (mock).</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-black/20 p-4">
            <div className="text-sm font-semibold text-white/85">HMM confidence by regime (mock)</div>
            <div style={{ width: '100%', height: 280 }} className="mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={probMock} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#0b0b12',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                    }}
                    formatter={(v) => [`${Number(v ?? 0)}%`, 'Probability']}
                  />
                  <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                    {probMock.map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-glow">
          <h2 className="text-lg font-semibold text-white/90">What this means</h2>
          <div className="mt-4 space-y-4 text-sm text-white/70">
            {Object.keys(explanationMap).map((k) => (
              <div key={k}>
                <div className="font-semibold text-white/90">{k}</div>
                <div className="mt-1 leading-relaxed">{explanationMap[k].body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
