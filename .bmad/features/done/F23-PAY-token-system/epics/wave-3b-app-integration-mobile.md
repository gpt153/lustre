# Epic: wave-3b-app-integration-mobile

**Wave:** 3
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Add token deduction hooks in mobile app for Gatekeeper and Coach services. Show insufficient balance prompt. Deep link to payment page.

## Context

### Gatekeeper mobile integration
`packages/app/src/hooks/useGatekeeper.ts` — currently calls `gatekeeper.respond` to proceed.
`packages/app/src/screens/GatekeeperConversationScreen.tsx` — reads file first before editing.

When gatekeeper responds, if backend throws PRECONDITION_FAILED:
- Show modal: "Du har inte tillräckligt med tokens" + button "Fyll på" (deep link to pay page)
- Don't crash the app — catch the error

### Coach mobile integration
`packages/app/src/hooks/useCoach.ts` — currently calls coach.end to stop session.
When starting a session or on coach.end (billing), if insufficient balance:
- Show same insufficient balance modal

### Deep link to pay page
`pay.lovelustre.com/pay` — use `Linking.openURL('https://pay.lovelustre.com/pay')` from `expo-linking`
OR for MVP: show a simple modal with the URL to visit

### New hook: useTokenBalance
`packages/app/src/hooks/useTokenBalance.ts`:
```ts
import { trpc } from '@lustre/api'
export function useTokenBalance() {
  const query = trpc.token.getBalance.useQuery()
  return { balance: query.data?.balance ?? 0, isLoading: query.isLoading }
}
```

### Insufficient balance modal component
`packages/app/src/components/InsufficientBalanceModal.tsx`:
- Tamagui `Sheet` or `YStack` modal overlay
- Title: "Fyll på ditt konto"
- Body: "Du har inte tillräckligt med tokens för att fortsätta. Besök pay.lovelustre.com för att fylla på."
- Button "Öppna betalningssidan" → `Linking.openURL('https://pay.lovelustre.com/pay')`
- Button "Stäng" → close

### Error handling pattern
In hooks, catch TRPCClientError with code PRECONDITION_FAILED, return `{ error: 'INSUFFICIENT_BALANCE' }`.

## Acceptance Criteria
1. `packages/app/src/hooks/useTokenBalance.ts` created — useTokenBalance hook
2. `packages/app/src/components/InsufficientBalanceModal.tsx` created — modal component
3. `packages/app/src/hooks/useGatekeeper.ts` updated: `respond` function catches PRECONDITION_FAILED, returns `{ error: 'INSUFFICIENT_BALANCE' }` instead of throwing
4. `packages/app/src/screens/GatekeeperConversationScreen.tsx` — read it first; add state for `showBalanceModal`, set it when `respond` returns `INSUFFICIENT_BALANCE`, show `InsufficientBalanceModal`
5. `packages/app/src/hooks/useCoach.ts` updated: `createSession` catches PRECONDITION_FAILED, returns error indicator
6. `packages/app/src/screens/CoachStartScreen.tsx` — read it first; add insufficient balance modal when useCoach returns PRECONDITION_FAILED
7. No prices visible anywhere — modal only says "tokens" not SEK amounts
8. No TODO/FIXME

## Files to Create/Modify
- `packages/app/src/hooks/useTokenBalance.ts` — new
- `packages/app/src/components/InsufficientBalanceModal.tsx` — new
- `packages/app/src/hooks/useGatekeeper.ts` — update respond function
- `packages/app/src/screens/GatekeeperConversationScreen.tsx` — add modal
- `packages/app/src/hooks/useCoach.ts` — update createSession
- `packages/app/src/screens/CoachStartScreen.tsx` — add modal
