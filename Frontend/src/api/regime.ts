import api from './axiosConfig'
import type { AssetId } from '../types'

export type RegimeInfo = {
  asset: AssetId
  asof: string
  regime: string
  hmm_state: number
}

export type RegimeResponse = {
  nifty?: RegimeInfo
  sp500?: RegimeInfo
} & Partial<RegimeInfo>

export async function fetchRegime(asset?: AssetId): Promise<RegimeInfo | RegimeResponse> {
  const res = await api.get('/regime', { params: asset ? { asset } : undefined })
  return res.data as RegimeInfo | RegimeResponse
}

