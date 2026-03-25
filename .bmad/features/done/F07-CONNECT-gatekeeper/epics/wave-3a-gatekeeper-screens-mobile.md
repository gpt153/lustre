# Epic: wave-3a-gatekeeper-screens-mobile
**Model:** haiku
**Wave:** 3, Group A (parallel)

## Description
Mobile UI for Gatekeeper: conversation UI in chat, config settings screen, AI-qualified badge display.

## Acceptance Criteria
1. GatekeeperConversationScreen: displays AI conversation messages in chat bubble format, input field for sender responses
2. GatekeeperSettingsScreen: toggle enabled, select strictness, set custom questions, set dealbreakers, select AI tone
3. AI-qualified badge component: small badge shown on messages that passed Gatekeeper
4. Hook useGatekeeper: wraps tRPC calls for initiate, respond, getConfig, updateConfig, toggle, checkRequired
5. Settings accessible from profile settings area
6. Conversation screen accessible when initiating contact with Gatekeeper-protected user
7. Loading states and error handling for AI responses
8. No TODO/FIXME comments

## File Paths
- packages/app/src/screens/GatekeeperConversationScreen.tsx (new)
- packages/app/src/screens/GatekeeperSettingsScreen.tsx (new)
- packages/app/src/components/AiQualifiedBadge.tsx (new)
- packages/app/src/hooks/useGatekeeper.ts (new)
- packages/app/src/index.ts (export new components)
- apps/mobile/app/(tabs)/profile/gatekeeper.tsx (new route)
