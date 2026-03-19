import { useMutation } from '@tanstack/react-query'
import type { BacktestRequest } from '../types'
import { backtestAll, type BacktestResponse } from '../api/backtest'

export function useBacktest() {
  return useMutation({
    mutationFn: (args: BacktestRequest) => backtestAll(args),
  })
}

export type { BacktestResponse }

