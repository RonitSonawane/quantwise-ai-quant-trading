export type AssetId = 'nifty' | 'sp500'

export type UserType = 'individual' | 'student' | 'organization'

export type StrategyColumn =
  | 'Buy_Hold'
  | 'Combined_v3'
  | 'ML_Signal'
  | 'Regime_Aware_v3'
  | string

export type BacktestRequest = {
  start_date: string
  end_date: string
  initial_capital: number
  refresh_data?: boolean
}

