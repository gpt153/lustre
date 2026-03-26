# Epic: wave-3c-app-integration-web

**Wave:** 3
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Same token integration as wave-3b but for the web app: Gatekeeper and Coach pages show insufficient balance prompt with link to pay.lovelustre.com.

## Context

### Web gatekeeper pages
`apps/web/app/(app)/gatekeeper/` — check what files exist there
`apps/web/app/(app)/settings/gatekeeper/page.tsx` — settings

### Web coach pages
`apps/web/app/(app)/coach/` — check what files exist there

### tRPC in web
Components use `'use client'` + React hooks + `trpc.X.useQuery()` / `trpc.X.useMutation()`

### Insufficient balance handling for web
When a tRPC mutation throws with PRECONDITION_FAILED:
- Show an inline alert/banner: "Du har inte tillräckligt med tokens. [Fyll på →](https://pay.lovelustre.com/pay)"
- Use a simple `useState` for showing the banner
- Link opens in new tab: `target="_blank"`

### Pattern to follow
Look at existing web screens like `apps/web/app/(app)/coach/start/page.tsx` and `apps/web/app/(app)/gatekeeper/[conversationId]/page.tsx` for the pattern.

### TRPCClientError import
```ts
import { TRPCClientError } from '@trpc/client'
```
Check for `error.data?.code === 'PRECONDITION_FAILED'` OR `error.message === 'Insufficient tokens'`

## Acceptance Criteria
1. `apps/web/app/(app)/gatekeeper/[conversationId]/page.tsx` — read it first; add insufficient balance banner when respond mutation fails with PRECONDITION_FAILED; banner has link to pay page
2. `apps/web/app/(app)/coach/start/page.tsx` — read it first; add insufficient balance banner when session creation fails; link to pay page
3. Banner text: "Otillräckliga tokens. [Fyll på ditt konto →](https://pay.lovelustre.com/pay)"
4. No prices visible — only "tokens" language, link is to pay page
5. Banner dismissible (X button or close)
6. No TODO/FIXME

## Files to Modify
- `apps/web/app/(app)/gatekeeper/[conversationId]/page.tsx` — add balance error handling
- `apps/web/app/(app)/coach/start/page.tsx` — add balance error handling

## Note
If files don't exist at exact paths, read the directory to find the right file. Adapt paths accordingly.
