export default function RegimeBadge({ regime }: { regime: string }) {
  const lower = regime.toLowerCase()
  const isBull = lower.includes('bull')
  const isBear = lower.includes('bear')
  const cls = isBull
    ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/25'
    : isBear
      ? 'bg-red-500/15 text-red-200 border-red-500/25'
      : 'bg-amber-500/15 text-amber-200 border-amber-500/25'

  return (
    <div className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold ${cls}`}>
      {regime}
    </div>
  )
}

