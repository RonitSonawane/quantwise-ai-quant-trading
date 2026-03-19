export function formatCurrencyINR(value: number) {
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-IN', { maximumFractionDigits: 2 })
  return `${sign}Rs ${formatted}`
}

export function formatPercent(value: number) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(2)}%`
}

export function safeNumber(v: unknown, fallback = 0) {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : fallback
}

