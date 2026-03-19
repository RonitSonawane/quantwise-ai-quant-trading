import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const mock = Array.from({ length: 60 }).map((_, i) => {
  const t = i / 59
  return {
    x: `D-${59 - i}`,
    Buy_Hold: 100000 * (1 + 0.1039 * t),
    Combined_v3: 100000 * (1 + 0.3991 * t),
    ML_Signal: 100000 * (1 + 0.3633 * t),
    Regime_Aware_v3: 100000 * (1 + 0.3464 * t),
  }
})

export default function StrategyComparisonChart() {
  return (
    <div className="h-[300px] w-full rounded-2xl border border-white/10 bg-black/20 p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mock} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <XAxis dataKey="x" tick={false} />
          <YAxis width={70} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}K`} />
          <Tooltip contentStyle={{ background: '#0b0b12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
          <Line type="monotone" dataKey="Buy_Hold" stroke="#9ca3af" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="Regime_Aware_v3" stroke="#2563EB" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="ML_Signal" stroke="#0D9488" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="Combined_v3" stroke="#7C3AED" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

