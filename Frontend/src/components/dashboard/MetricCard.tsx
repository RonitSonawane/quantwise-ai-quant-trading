import { TrendingDown, TrendingUp } from 'lucide-react'

export default function MetricCard({
  label,
  value,
  sub,
  trend,
}: {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4 shadow-glow">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-white/55">{label}</div>
        {trend === 'up' ? (
          <TrendingUp className="size-4 shrink-0 text-emerald-400" aria-hidden />
        ) : trend === 'down' ? (
          <TrendingDown className="size-4 shrink-0 text-red-400" aria-hidden />
        ) : null}
      </div>
      <div className="mt-2 text-lg font-semibold tabular-nums text-white/90">{value}</div>
      {sub ? <div className="mt-2 text-xs text-white/55">{sub}</div> : null}
    </div>
  )
}
