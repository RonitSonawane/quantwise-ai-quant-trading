import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export type EquityPoint = { date: string; value: number }

export default function EquityCurveChart({
  data,
  height = 300,
}: {
  data: EquityPoint[]
  height?: number
}) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            label={{ value: 'Date', position: 'bottom', offset: 0, fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
            tickFormatter={(v) =>
              `Rs ${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
            }
            width={88}
            label={{
              value: 'Portfolio Value (Rs)',
              angle: -90,
              position: 'insideLeft',
              fill: 'rgba(255,255,255,0.45)',
              fontSize: 11,
            }}
          />
          <Tooltip
            contentStyle={{
              background: '#0b0b12',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}
            labelFormatter={(l) => `Date: ${l}`}
            formatter={(value) => [
              `Rs ${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
              'Value',
            ]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#eqFill)"
            dot={false}
            activeDot={{ r: 4, fill: '#4ade80' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
