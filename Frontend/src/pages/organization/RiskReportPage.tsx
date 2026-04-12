import { useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

const card = 'rounded-xl border border-white/[0.08] bg-[#12121A] p-5'

export default function OrganizationRiskReportPage() {
  const series = useMemo(
    () =>
      Array.from({ length: 80 }).map((_, i) => ({
        x: i,
        stress: Math.max(0, 40 - i * 0.3 + Math.sin(i / 4) * 8),
      })),
    [],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Risk report</h1>
        <p className="mt-1 text-sm text-white/55">Executive view of tail risk, stress, and concentration.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Portfolio VaR (99%, 1d)', '-3.8%'],
          ['Largest 5-day loss (hist)', '-6.2%'],
          ['Current gross exposure', '98%'],
          ['Options / overlays', 'None'],
          ['Factor concentration (momentum)', 'Elevated'],
          ['Liquidity score', 'A-'],
        ].map(([a, b]) => (
          <div key={a} className={card}>
            <div className="text-xs text-white/45">{a}</div>
            <div className="mt-2 text-lg font-semibold text-white">{b}</div>
          </div>
        ))}
      </div>

      <div className={card}>
        <h2 className="text-lg font-semibold text-white">Stress index (mock)</h2>
        <div style={{ width: '100%', height: 300, minWidth: 0, minHeight: 0 }} className="mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="x" tick={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0b0b12', border: '1px solid rgba(255,255,255,0.08)' }} />
              <Area type="monotone" dataKey="stress" stroke="#f59e0b" fill="rgba(245,158,11,0.15)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={card}>
        <h2 className="text-lg font-semibold text-white">Mitigations in place</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-white/65">
          <li>Regime-aware de-risking via Combined_v3 sleeve weights</li>
          <li>Drawdown caps on high-alpha sleeves in Weak Sideways</li>
          <li>Monthly rebalance and liquidity checks on underlying ETFs</li>
        </ul>
      </div>
    </div>
  )
}
