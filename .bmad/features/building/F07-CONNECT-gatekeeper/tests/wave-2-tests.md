# Test Specification: F07 Wave 2 — AI Qualification Engine

## API Tests
- [ ] POST /gatekeeper/initiate creates a new GatekeeperConversation with status "active"
- [ ] POST /gatekeeper/message sends user message and receives AI response within 2 seconds
- [ ] AI asks questions relevant to recipient's preferences (not generic)
- [ ] AI never reveals recipient's dealbreakers verbatim
- [ ] On match determination, message is delivered with "AI-qualified" badge
- [ ] On mismatch, sender receives constructive redirect message
- [ ] Token balance checked before conversation starts
- [ ] Tokens debited on conversation completion (~2 SEK equivalent)
- [ ] Insufficient balance returns 402 with topup prompt
- [ ] Recipient is NEVER charged (balance unchanged)

## AI Behavior Tests
- [ ] Sender matching all criteria: pass within 3-5 exchanges
- [ ] Sender clearly not matching: polite redirect within 2-3 exchanges
- [ ] Sender lying about criteria: AI detects inconsistencies and probes further
- [ ] Pair profile: AI addresses the pair as a unit
- [ ] AI tone matches config: formal / casual / flirty
- [ ] Strict mode: more questions, higher bar for passing
- [ ] Mild mode: fewer questions, lower bar

## Integration Tests
- [ ] Mutual match (both liked): Gatekeeper bypassed, message delivered directly
- [ ] Token deduction atomic: no double-charge on retry
- [ ] Conversation stored for 7 days then auto-purged
