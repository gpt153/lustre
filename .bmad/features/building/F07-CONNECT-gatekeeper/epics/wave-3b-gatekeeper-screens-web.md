# Epic: wave-3b-gatekeeper-screens-web
**Model:** haiku
**Wave:** 3, Group A (parallel with wave-3a)

## Description
Web UI for Gatekeeper: same screens as mobile but for Next.js web app.

## Acceptance Criteria
1. Gatekeeper conversation page at /gatekeeper/[conversationId] with chat UI
2. Gatekeeper settings page at /settings/gatekeeper with all config options
3. AI-qualified badge displayed on qualifying messages
4. Reuses shared hooks and components from packages/app/src
5. Responsive layout for desktop and mobile web
6. Loading states and error handling
7. Settings accessible from user profile/settings area
8. No TODO/FIXME comments

## File Paths
- apps/web/app/(app)/gatekeeper/[conversationId]/page.tsx (new)
- apps/web/app/(app)/settings/gatekeeper/page.tsx (new)
