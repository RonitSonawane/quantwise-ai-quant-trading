import { useQuery } from '@tanstack/react-query'
import type { AssetId } from '../types'
import { fetchStrategiesSeries } from '../api/strategies'

export function useStrategiesSeries(args: {
  asset: AssetId
  start_date?: string
  end_date?: string
  limit_points?: number
  enabled?: boolean
}) {
  return useQuery({
    queryKey: ['strategies', args.asset, args.start_date ?? '', args.end_date ?? '', args.limit_points ?? 800],
    queryFn: () => fetchStrategiesSeries(args),
    enabled: args.enabled ?? true,
    refetchOnWindowFocus: false,
  })
}

// Compatibility export name (matches requested structure)
export const useStrategies = useStrategiesSeries

