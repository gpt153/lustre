import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { CreateTRPCReact } from '@trpc/react-query'
import superjson from 'superjson'
import type { AppRouter } from '../../../services/api/src/trpc/router'

export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>()

export function createTRPCClient(apiUrl: string): ReturnType<typeof trpc.createClient> {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${apiUrl}/trpc`,
        transformer: superjson,
      }),
    ],
  })
}
