import { useMemo } from 'react'
import { Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, Cell, XAxis, YAxis } from 'recharts'

const allocation = [
  { name: 'NIFTY', value: 0.55, color: '#7C3AED' },
  { name: 'S&P 500', value: 0.45, color: '#2563EB' },
]

export default function IndividualPortfolioPage() {
  const equity = useMemo(
    () =>
      Array.from({ length: 45 }).map((_, i) => ({
        x: `D-${44 - i}`,
        value: 100000 * (1 + 0.22 * (i / 44)),
      })),
    [],
  )

  return (
    <div className="mx-auto max-w-7xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow">
        <h1 className="text-xl font-semibold text-white/90">Portfolio</h1>
        <p className="mt-1 text-sm text-white/60">Mock holdings + allocation view (wire to real portfolio model later).</p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 lg:col-span-1">
            <div className="text-sm font-semibold text-white/80">Holdings Summary</div>
            <div className="mt-3 space-y-2 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <span>NIFTY Exposure</span>
                <span className="font-semibold text-white/90">55%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <span>S&P 500 Exposure</span>
                <span className="font-semibold text-white/90">45%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <span>Rebalance</span>
                <span className="font-semibold text-white/90">Monthly</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-semibold text-white/80">Allocation</div>
              <div className="mt-3 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocation} dataKey="value" innerRadius={35} outerRadius={60} paddingAngle={2}>
                      {allocation.map((a) => (
                        <Cell key={a.name} fill={a.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 lg:col-span-2">
            <div className="text-sm font-semibold text-white/80">Performance Over Time (Mock)</div>
            <div className="mt-3 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equity} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="x" tick={false} />
                  <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}K`} width={70} />
                  <Tooltip
                    contentStyle={{
                      background: '#0b0b12',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                    }}
                    formatter={(v) => [`Rs ${Number(v).toLocaleString('en-IN')}`, 'Value']}
                    labelFormatter={(v) => String(v)}
                  />
                  <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2} dot={false} name="Portfolio" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

