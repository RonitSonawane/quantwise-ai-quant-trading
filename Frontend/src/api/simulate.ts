import api from './axiosConfig'
import type { AssetId } from '../types'

export type SimulateResponse = {
  asset: AssetId
  strategy: string
  result: Record<string, unknown>
}

export async function simulateInvestment(args: {
  asset: AssetId
  strategy: string
  initial_capital: number
  limit_points?: number
}): Promise<SimulateResponse> {
  const res = await api.post('/simulate', args)
  return res.data as SimulateResponse
}

