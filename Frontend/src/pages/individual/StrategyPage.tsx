import { useMemo } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Crown } from 'lucide-react'

const mockSeries = Array.from({ length: 60 }).map((_, i) => {
  const t = i / 59
  const x = `D-${59 - i}`
  return {
    x,
    Buy_Hold: 100000 * (1 + 0.1039 * t),
    Combined_v3: 100000 * (1 + 0.3991 * t),
    ML_Signal: 100000 * (1 + 0.3633 * t),
    Regime_Aware_v3: 100000 * (1 + 0.3464 * t),
    Drawdown: -0.08 * Math.sin(t * Math.PI),
  }
})

const metrics = [
  { key: 'Combined_v3', annReturn: 39.91, sharpe: 1.65, maxDD: -0.12 },
  { key: 'ML_Signal', annReturn: 36.33, sharpe: 1.52, maxDD: -0.14 },
  { key: 'Regime_Aware_v3', annReturn: 34.64, sharpe: 1.47, maxDD: -0.13 },
  { key: 'Buy_Hold', annReturn: 10.39, sharpe: 0.85, maxDD: -0.22 },
]

export default function IndividualStrategyPage() {
  const winner = useMemo(() => {
    const combined = metrics.find((m) => m.key === 'Combined_v3')
    const bh = metrics.find((m) => m.key === 'Buy_Hold')
    const diff = (combined?.annReturn ?? 0) - (bh?.annReturn ?? 0)
    return { diff }
  }, [])

  const bestSharpe = useMemo(() => Math.max(...metrics.map((m) => m.sharpe)), [])
  const bestAnnReturn = useMemo(() => Math.max(...metrics.map((m) => m.annReturn)), [])
  const bestMaxDD = useMemo(() => Math.max(...metrics.map((m) => m.maxDD)), [])

  return (
    <div className="mx-auto max-w-7xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow">
        <h1 className="text-xl font-semibold text-white/90">Strategy Comparison</h1>
        <p className="mt-1 text-sm text-white/60">
          Combined_v3 vs ML_Signal vs Regime_Aware_v3 vs Buy_Hold (mock charts; wire to real API later).
        </p>

        <div className="mt-5 h-[260px] rounded-2xl border border-white/10 bg-black/20 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockSeries} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <XAxis dataKey="x" tick={false} />
              <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}K`} width={60} />
              <Tooltip
                contentStyle={{
                  background: '#0b0b12',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                }}
              />
              <Line type="monotone" dataKey="Buy_Hold" stroke="#9ca3af" dot={false} strokeWidth={2} name="Buy_Hold" />
              <Line type="monotone" dataKey="Regime_Aware_v3" stroke="#2563EB" dot={false} strokeWidth={2} name="Regime_Aware_v3" />
              <Line type="monotone" dataKey="ML_Signal" stroke="#0D9488" dot={false} strokeWidth={2} name="ML_Signal" />
              <Line type="monotone" dataKey="Combined_v3" stroke="#7C3AED" dot={false} strokeWidth={2} name="Combined_v3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {metrics.map((m) => {
            const isBestAnn = m.annReturn === bestAnnReturn
            const isBestSharpe = m.sharpe === bestSharpe
            const isBestDD = m.maxDD === bestMaxDD
            return (
              <div key={m.key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white/85">{m.key}</div>
                  <div className="text-xs text-white/50">{m.key === 'Combined_v3' ? 'Primary' : 'Model'}</div>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Ann Return</span>
                    <span className="text-white/90 inline-flex items-center gap-2">
                      {m.annReturn.toFixed(2)}%
                      {isBestAnn ? <Crown className="size-4 text-purple-300" /> : null}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Sharpe</span>
                    <span className="text-white/90 inline-flex items-center gap-2">
                      {m.sharpe.toFixed(2)}
                      {isBestSharpe ? <Crown className="size-4 text-purple-300" /> : null}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Max DD</span>
                    <span className="text-white/90 inline-flex items-center gap-2">
                      {m.maxDD.toFixed(2)}
                      {isBestDD ? <Crown className="size-4 text-purple-300" /> : null}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4">
          <div className="text-sm font-semibold text-purple-200">Winner Announcement</div>
          <div className="mt-1 text-white/80">
            Combined_v3 outperforms Buy & Hold by <span className="font-semibold text-white">{winner.diff.toFixed(2)}%</span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold text-white/80">Drawdown Chart</div>
            <div className="mt-3 h-[140px] rounded-xl bg-gradient-to-br from-white/5 to-purple-500/10 flex items-center justify-center text-sm text-white/60">
              Drawdown visualization placeholder (use Recharts in a full implementation).
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold text-white/80">Rolling Sharpe</div>
            <div className="mt-3 h-[140px] rounded-xl bg-gradient-to-br from-white/5 to-blue-500/10 flex items-center justify-center text-sm text-white/60">
              Rolling Sharpe visualization placeholder.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

