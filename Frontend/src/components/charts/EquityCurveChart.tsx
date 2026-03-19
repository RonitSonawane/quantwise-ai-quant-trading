import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

export type EquityPoint = { x: string; value: number }

export default function EquityCurveChart({ data }: { data: EquityPoint[] }) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
          <XAxis dataKey="x" tick={false} />
          <YAxis tickFormatter={(v) => `${Math.round(v)}`} width={60} />
          <Tooltip
            contentStyle={{
              background: '#0b0b12',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}
            labelFormatter={(v) => String(v)}
            formatter={(value) => [Number(value).toFixed(0), 'Value']}
          />
          <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

