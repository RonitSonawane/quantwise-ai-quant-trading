import { useMemo } from 'react'
import { Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, Cell, XAxis, YAxis, CartesianGrid } from 'recharts'

const allocation = [
  { name: 'NIFTY', value: 0.55, color: '#7C3AED' },
  { name: 'S&P 500', value: 0.45, color: '#2563EB' },
]

export default function IndividualPortfolioPage() {
  const equity = useMemo(
    () =>
      Array.from({ length: 45 }).map((_, i) => ({
        date: `2025-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
        value: 100000 * (1 + 0.22 * (i / 44)),
      })),
    [],
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Portfolio</h1>
        <p className="mt-1 text-sm text-white/60">Mock holdings and allocation (replace with live portfolio API later).</p>
      </div>

      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-glow">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-black/20 p-4 lg:col-span-1">
            <div className="text-lg font-semibold text-white/85">Holdings summary</div>
            <div className="mt-4 space-y-2 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-white/5 p-3">
                <span>NIFTY exposure</span>
                <span className="font-semibold text-white/90">55%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-white/5 p-3">
                <span>S&amp;P 500 exposure</span>
                <span className="font-semibold text-white/90">45%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-white/5 p-3">
                <span>Rebalance</span>
                <span className="font-semibold text-white/90">Monthly</span>
              </div>
            </div>
            <div className="mt-5">
              <div className="text-sm font-semibold text-white/80">Allocation</div>
              <div style={{ width: '100%', height: 300, minWidth: 0, minHeight: 0 }} className="mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocation} dataKey="value" innerRadius={40} outerRadius={72} paddingAngle={2}>
                      {allocation.map((a) => (
                        <Cell key={a.name} fill={a.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-black/20 p-4 lg:col-span-2">
            <div className="text-lg font-semibold text-white/85">Performance (mock)</div>
            <div style={{ width: '100%', height: 300 }} className="mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equity} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} interval={6} />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                    tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                    width={56}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0b0b12',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                    }}
                    formatter={(v) => [`Rs ${Number(v).toLocaleString('en-IN')}`, 'Value']}
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
