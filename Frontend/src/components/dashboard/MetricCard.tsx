export default function MetricCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glow">
      <div className="text-xs font-semibold text-white/60">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white/90">{value}</div>
      {sub ? <div className="mt-2 text-xs text-white/60">{sub}</div> : null}
    </div>
  )
}

