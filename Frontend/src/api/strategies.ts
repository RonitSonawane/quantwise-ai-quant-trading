import api from './axiosConfig'
import type { AssetId } from '../types'

export type StrategiesSeriesResponse = {
  asset: AssetId
  start_date: string | null
  end_date: string | null
  strategies: string[]
  data: Array<Record<string, unknown>> & Array<{ date: string }>
}

export async function fetchStrategiesSeries(args: {
  asset: AssetId
  start_date?: string
  end_date?: string
  limit_points?: number
}): Promise<StrategiesSeriesResponse> {
  const res = await api.get('/strategies', { params: args })
  return res.data as StrategiesSeriesResponse
}

