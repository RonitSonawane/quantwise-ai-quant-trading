export default function RegimeBadge({
  regime,
  pulse,
}: {
  regime: string
  /** Pulse animation for the live / primary regime chip */
  pulse?: boolean
}) {
  const lower = regime.toLowerCase()
  const isBull = lower.includes('bull')
  const isBear = lower.includes('bear')
  const cls = isBull
    ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
    : isBear
      ? 'bg-red-500/15 text-red-200 border-red-500/30'
      : 'bg-amber-500/15 text-amber-200 border-amber-500/35'

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full border-2 px-5 py-2.5 text-base font-semibold ${cls} ${
        pulse ? 'animate-pulse shadow-[0_0_20px_rgba(124,58,237,0.35)]' : ''
      }`}
    >
      {regime}
    </div>
  )
}
