import { useMemo } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
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
      </div>
    </div>
  )
}
