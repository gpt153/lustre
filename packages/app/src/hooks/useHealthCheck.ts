import type { UseQueryResult } from '@tanstack/react-query'
import { trpc } from '@lustre/api'

export function useHealthCheck(): UseQueryResult<
  { status: 'ok'; timestamp: Date } | undefined,
  unknown
> {
  return trpc.health.check.useQuery()
}
