# Test Spec: Wave 1 — Profile Schema & API

## Tests
1. **Profile CRUD via tRPC** — Create a profile, read it back, update fields, verify changes persisted
2. **Enum values stored correctly** — Create profiles with each gender/orientation/relationship enum value, verify DB stores correctly
3. **getPublic excludes private fields** — Create profile with contentPreference, call getPublic, verify contentPreference is NOT in response
4. **Duplicate profile prevention** — Create profile for user, try to create another, expect 409 error
5. **Age validation** — Try age < 18 and > 99, expect validation error
6. **Profile not found** — Call getPublic with non-existent userId, expect 404
