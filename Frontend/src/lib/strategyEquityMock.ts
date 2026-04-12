/** Mock equity curves ending at final portfolio values (Rs) from a 10L research run. */

const START = 1_000_000

export const STRATEGY_FINAL_RS = {
  Combined_v3: 3_943_200,
  ML_Signal: 2_482_663,
  Regime_Aware_v3: 1_985_644,
  Buy_Hold: 581_349,
} as const

export type StrategyKey = keyof typeof STRATEGY_FINAL_RS

export function buildMultiStrategyEquityPoints(n = 72) {
  const keys = Object.keys(STRATEGY_FINAL_RS) as StrategyKey[]
  return Array.from({ length: n }).map((_, i) => {
    const t = i / (n - 1)
    const row: Record<string, string | number> = {
      x: `T${String(i).padStart(2, '0')}`,
    }
    for (const k of keys) {
      const end = STRATEGY_FINAL_RS[k]
      row[k] = Math.round(START + (end - START) * t)
    }
    return row
  })
}
