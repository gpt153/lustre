# Test Specification: F13 Wave 1 — SafeDate Backend

## API Tests
- [ ] POST /safedate/activate creates SafeDate record with: targetUser, duration, safetyContacts, GPS start position
- [ ] POST /safedate/checkin with valid PIN resets timer and returns new expiry
- [ ] POST /safedate/checkin with invalid PIN returns 401
- [ ] POST /safedate/extend extends duration by specified minutes
- [ ] POST /safedate/end marks SafeDate as completed, schedules GPS log deletion (24h)

## Escalation Tests
- [ ] Timer expiry triggers escalation state change to "escalating"
- [ ] 5 minutes without check-in: SMS sent to all safety contacts with GPS coordinates
- [ ] SMS contains: user's display name, last known GPS, map link, escalation status
- [ ] 10 minutes without response: status changes to "emergency"
- [ ] GPS data encrypted at rest (AES-256)
- [ ] GPS log deleted 24h after SafeDate completion (non-escalated)
- [ ] GPS log retained indefinitely for escalated SafeDates (legal evidence)

## GPS Streaming Tests
- [ ] GPS endpoint accepts location updates every 5-10 seconds
- [ ] Invalid GPS coordinates (outside Earth) rejected
- [ ] GPS updates authenticated (only the SafeDate owner can send)
- [ ] Live location queryable by safety contacts with valid token

## Safety Tests
- [ ] SafeDate is ALWAYS free (token.deduct never called)
- [ ] Rate limiting: max 3 active SafeDates per user
- [ ] SafeDate cannot be activated without at least 1 safety contact
