import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from 'recharts'
import { buildMultiStrategyEquityPoints } from '../../lib/strategyEquityMock'

const mock = buildMultiStrategyEquityPoints(80)

export default function StrategyComparisonChart({ height = 300 }: { height?: number }) {
  return (
    <div
      style={{ width: '100%', height, minWidth: 0, minHeight: 0 }}
      className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-3"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mock} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="x" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} interval={10} />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
            width={72}
            tickFormatter={(v) => `${Math.round(Number(v) / 100000)}L`}
          />
          <Tooltip
            contentStyle={{
              background: '#0b0b12',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}
            formatter={(v) =>
              `Rs ${Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
            }
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="Buy_Hold" stroke="#9ca3af" dot={false} strokeWidth={2} name="Buy_Hold" />
          <Line type="monotone" dataKey="Regime_Aware_v3" stroke="#2563eb" dot={false} strokeWidth={2} name="Regime_Aware_v3" />
          <Line type="monotone" dataKey="ML_Signal" stroke="#0d9488" dot={false} strokeWidth={2} name="ML_Signal" />
          <Line type="monotone" dataKey="Combined_v3" stroke="#7c3aed" dot={false} strokeWidth={2} name="Combined_v3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
