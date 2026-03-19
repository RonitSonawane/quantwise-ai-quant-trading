import { useQuery } from '@tanstack/react-query'
import type { AssetId } from '../types'
import { fetchRegime, type RegimeInfo } from '../api/regime'

export function useRegime(asset?: AssetId) {
  return useQuery({
    queryKey: ['regime', asset ?? 'both'],
    queryFn: () => fetchRegime(asset),
    refetchOnWindowFocus: false,
  })
}

export type { RegimeInfo }

