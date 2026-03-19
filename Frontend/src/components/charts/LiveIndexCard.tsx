import { TrendingDown, TrendingUp } from 'lucide-react'

export default function LiveIndexCard({
  name,
  value,
  changePct,
}: {
  name: string
  value: number
  changePct: number
}) {
  const positive = changePct >= 0
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glow">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white/80">{name}</div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
            positive ? 'bg-emerald-500/15 text-emerald-200' : 'bg-red-500/15 text-red-200'
          }`}
        >
          {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {positive ? '+' : ''}
          {changePct.toFixed(2)}%
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">
        {value.toLocaleString('en-IN')}
      </div>
    </div>
  )
}

