/** Order and labels for ML service `/backtest` strategy rows (see `backtest_engine.compute_metrics`). */

const PRIORITY: string[] = [
  'Strategy',
  'Cumulative Return (%)',
  'Ann. Return (%)',
  'Ann. Volatility (%)',
  'Sharpe Ratio',
  'Sortino Ratio',
  'Max Drawdown (%)',
  'Calmar Ratio',
  'Win Rate (%)',
  'Profit Factor',
  'Alpha (Ann.)',
  'Beta',
]

const LABELS: Record<string, string> = {
  Strategy: 'Strategy',
  'Cumulative Return (%)': 'Cumul. Return%',
  'Ann. Return (%)': 'Ann. Return%',
  'Ann. Volatility (%)': 'Volatility%',
  'Sharpe Ratio': 'Sharpe',
  'Sortino Ratio': 'Sortino',
  'Max Drawdown (%)': 'Max DD%',
  'Calmar Ratio': 'Calmar',
  'Win Rate (%)': 'Win Rate%',
  'Profit Factor': 'Profit Factor',
  'Alpha (Ann.)': 'Alpha (Ann.)',
  Beta: 'Beta',
}

function isFinalValueKey(k: string) {
  return k.startsWith('Final Value')
}

export function buildStrategyTableColumns(sample: Record<string, unknown> | undefined) {
  if (!sample) return []
  const keys = Object.keys(sample)
  const ordered: string[] = []
  for (const p of PRIORITY) {
    if (keys.includes(p)) ordered.push(p)
  }
  for (const k of keys) {
    if (!ordered.includes(k)) ordered.push(k)
  }
  return ordered.map((key) => ({
    key,
    label: isFinalValueKey(key) ? 'Final Value' : (LABELS[key] ?? key),
  }))
}
