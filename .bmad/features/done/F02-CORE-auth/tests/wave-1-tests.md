# Test Specification: F02 Wave 1 — Auth Backend

## API Tests
- [ ] POST /auth/bankid/init returns BankID order reference and autostart token
- [ ] POST /auth/bankid/collect with valid order returns user data (personnummer, name)
- [ ] POST /auth/bankid/collect with under-18 personnummer returns 403 with age rejection message
- [ ] POST /auth/bankid/collect with already-registered personnummer returns 409 conflict
- [ ] JWT token generated on successful auth contains userId and expiry
- [ ] JWT validation middleware rejects expired tokens (401)
- [ ] JWT validation middleware rejects malformed tokens (401)
- [ ] Session created in DB on successful auth
- [ ] Multiple sessions per user tracked correctly

## Security Tests
- [ ] BankID callback only accepted from Criipto/Idura IPs
- [ ] Rate limiting: max 5 auth attempts per IP per minute
- [ ] Personnummer stored as SHA-256 hash for uniqueness check (not plaintext)
