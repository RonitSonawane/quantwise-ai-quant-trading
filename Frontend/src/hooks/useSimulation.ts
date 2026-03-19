import { useMutation } from '@tanstack/react-query'
import { simulateInvestment, type SimulateResponse } from '../api/simulate'

export function useSimulation() {
  return useMutation({
    mutationFn: (args: {
      asset: 'nifty' | 'sp500'
      strategy: string
      initial_capital: number
      limit_points?: number
    }) => simulateInvestment(args),
  })
}

export type { SimulateResponse }

