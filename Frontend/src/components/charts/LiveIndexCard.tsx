import { TrendingDown, TrendingUp } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer } from 'recharts'

function buildSpark(seed: number) {
  return Array.from({ length: 7 }).map((_, i) => ({
    i,
    v: 100 + seed * 0.3 + Math.sin(i * 0.9 + seed) * 4 + i * 0.8,
  }))
}

export default function LiveIndexCard({
  name,
  value,
  changePct,
  sparkSeed = 1,
}: {
  name: string
  value: number
  changePct: number
  sparkSeed?: number
}) {
  const positive = changePct >= 0
  const spark = buildSpark(sparkSeed)
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4 shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white/80">{name}</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums text-white">
            {value.toLocaleString('en-IN')}
          </div>
          <span
            className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
              positive ? 'bg-emerald-500/15 text-emerald-200' : 'bg-red-500/15 text-red-200'
            }`}
          >
            {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {positive ? '+' : ''}
            {changePct.toFixed(2)}%
          </span>
        </div>
        <div style={{ width: 120, height: 56 }} className="shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={positive ? '#34d399' : '#f87171'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
