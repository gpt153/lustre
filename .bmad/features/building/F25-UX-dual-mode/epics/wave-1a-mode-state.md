# Epic: wave-1a-mode-state

**Wave:** 1
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Create a `settings` tRPC router exposing `getMode` / `setMode` endpoints backed by the existing `Profile.spicyModeEnabled` field, plus a shared `modeStore.ts` Zustand store with persistence, and a `useMode` hook.

## Context

### Existing patterns
- Auth store: `packages/app/src/stores/authStore.ts` — uses `create<State>()(persist(...))` with SSR-safe storage
- Profile router: `services/api/src/trpc/profile-router.ts` — `toggleSpicyMode` mutation at line ~188 already exists, updates `Profile.spicyModeEnabled`
- Router assembly: `services/api/src/trpc/router.ts` — add `settings: settingsRouter` entry
- tRPC middleware: `services/api/src/trpc/middleware.ts` — exports `router`, `protectedProcedure`
- Barrel: `packages/app/src/index.ts` — add exports

### No new Prisma migration needed
`Profile.spicyModeEnabled Boolean @default(false)` already exists. The settings router wraps it.

## Acceptance Criteria
1. `services/api/src/trpc/settings-router.ts` exists with `getMode` query (returns `{ mode: 'vanilla' | 'spicy' }`) and `setMode` mutation (input: `{ mode: 'vanilla' | 'spicy' }`)
2. `settings-router.ts` reads/writes `Profile.spicyModeEnabled` (vanilla = false, spicy = true)
3. `router.ts` imports and mounts `settingsRouter` as `settings:`
4. `packages/app/src/stores/modeStore.ts` exists — Zustand `persist` store with `mode: 'vanilla' | 'spicy'` (default `'vanilla'`), SSR-safe storage, `setMode` action
5. `packages/app/src/hooks/useMode.ts` exists — `useMode()` hook that returns `{ mode, setMode, isSpicy, isLoading }`, calls `trpc.settings.setMode` on change and updates the store
6. `packages/app/src/index.ts` exports `useModeStore` and `useMode`
7. Default mode for new users is vanilla (spicyModeEnabled = false → mode = 'vanilla')

## File Paths
1. `services/api/src/trpc/settings-router.ts` — CREATE
2. `services/api/src/trpc/router.ts` — EDIT (add settings router import + mount)
3. `packages/app/src/stores/modeStore.ts` — CREATE
4. `packages/app/src/hooks/useMode.ts` — CREATE
5. `packages/app/src/index.ts` — EDIT (add exports)

## Implementation Notes

### settings-router.ts pattern
```typescript
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'

export const settingsRouter = router({
  getMode: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.profile.findUnique({
      where: { userId: ctx.userId },
      select: { spicyModeEnabled: true },
    })
    if (!profile) throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
    return { mode: profile.spicyModeEnabled ? 'spicy' : 'vanilla' } as { mode: 'vanilla' | 'spicy' }
  }),

  setMode: protectedProcedure
    .input(z.object({ mode: z.enum(['vanilla', 'spicy']) }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({ where: { userId: ctx.userId } })
      if (!profile) throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
      await ctx.prisma.profile.update({
        where: { userId: ctx.userId },
        data: { spicyModeEnabled: input.mode === 'spicy' },
      })
      return { mode: input.mode }
    }),
})
```

### modeStore.ts pattern (follow authStore.ts exactly)
```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ModeState {
  mode: 'vanilla' | 'spicy'
  setMode: (mode: 'vanilla' | 'spicy') => void
}

const storage = typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: 'vanilla',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'lustre-mode',
      storage: storage ?? createJSONStorage(() => ({
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
)
```

### useMode.ts pattern (follow useLearn.ts hook pattern)
```typescript
import { trpc } from '@lustre/api'
import { useCallback, useEffect } from 'react'
import { useModeStore } from '../stores/modeStore'

export function useMode() {
  const { mode, setMode } = useModeStore()
  const modeQuery = trpc.settings.getMode.useQuery(undefined, { staleTime: 30_000 })
  const setModeMutation = trpc.settings.setMode.useMutation()

  // Sync remote → store on load
  useEffect(() => {
    if (modeQuery.data) {
      setMode(modeQuery.data.mode)
    }
  }, [modeQuery.data, setMode])

  const handleSetMode = useCallback(
    async (newMode: 'vanilla' | 'spicy') => {
      setMode(newMode) // optimistic
      await setModeMutation.mutateAsync({ mode: newMode })
    },
    [setMode, setModeMutation]
  )

  return {
    mode,
    setMode: handleSetMode,
    isSpicy: mode === 'spicy',
    isLoading: modeQuery.isLoading,
  }
}
```
