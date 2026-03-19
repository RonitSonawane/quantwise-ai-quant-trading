import api from './axiosConfig'

import type { BacktestRequest, AssetId } from '../types'

export type BacktestResponse = {
  meta: Record<string, unknown>
  backtests: Record<AssetId, Array<Record<string, unknown>>>
  strategies: Record<AssetId, string[]>
}

export async function backtestAll(args: BacktestRequest): Promise<BacktestResponse> {
  const res = await api.post('/backtest', args)
  return res.data as BacktestResponse
}

