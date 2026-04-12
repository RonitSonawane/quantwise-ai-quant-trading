import { useMemo } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer } from 'recharts'

function mapName(name: string): { symbol: string; label: string } {
  if (name.includes('S&P')) return { symbol: 'ETHUSDT', label: 'S&P 500 (Live Demo)' }
  if (name.includes('SENSEX')) return { symbol: 'BNBUSDT', label: 'SENSEX (Live Demo)' }
  return { symbol: 'BTCUSDT', label: 'NIFTY 50 (Live Demo)' }
}

function buildSparkData(value: number, changePct: number, points = 14) {
  const bump = 1 + changePct / 300
  const start = value / bump
  return Array.from({ length: points }, (_, i) => ({
    i,
    value: start + ((value - start) * i) / (points - 1) + Math.sin(i * 0.9) * (value * 0.0015),
  }))
}

export default function LiveIndexCard({
  name,
  value,
  changePct,
}: {
  name: string
  value: number
  changePct: number
  sparkSeed?: number
}) {
  const positive = changePct >= 0
  const { label } = mapName(name)
  const sparkData = useMemo(() => buildSparkData(value, changePct), [value, changePct])

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4 shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white/80">{name}</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums text-white">{value.toLocaleString('en-IN')}</div>
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
        <div
          className="shrink-0 overflow-hidden rounded-lg border border-white/[0.06] bg-black/30"
          style={{
            width: '120px',
            height: '50px',
            minWidth: '120px',
            minHeight: '50px',
            overflow: 'hidden',
          }}
          title={label}
        >
          <div style={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
                <Line type="monotone" dataKey="value" stroke="#26a69a" dot={false} strokeWidth={1.5} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
