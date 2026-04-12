export function regimeAccent(regime: string): string {
  const l = regime.toLowerCase()
  if (l.includes('strong') && l.includes('bull')) return '#22c55e'
  if (l.includes('strong') && l.includes('bear')) return '#ef4444'
  if (l.includes('weak') && l.includes('sideways')) return '#eab308'
  if (l.includes('bull')) return '#4ade80'
  if (l.includes('bear')) return '#f97316'
  return '#a78bfa'
}
