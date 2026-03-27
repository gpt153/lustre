# Test Specification: F23 Wave 1 — Token Core

## API Tests
- [ ] GET /token/balance returns balance with 5-decimal precision
- [ ] POST /token/deduct subtracts correct amount atomically
- [ ] POST /token/deduct with amount > balance returns 402 (insufficient)
- [ ] POST /token/deduct with concurrent requests: no race condition (total deducted = sum of individual deductions)
- [ ] Balance NEVER goes negative under any circumstance
- [ ] Transaction log created for every deduction with: amount, type, description, serviceRef, timestamp
- [ ] Transaction log is immutable (no UPDATE or DELETE)

## Spread Engine Tests
- [ ] Default spread (3.0x) applied correctly: base cost 0.00312 -> user cost 0.00936
- [ ] Per-segment spread override works: new users get 2.0x, returning get 3.0x
- [ ] Per-market spread override works: SE 3.0x, NO 3.5x
- [ ] Spread config change takes effect immediately (no cache staleness)
- [ ] 5-decimal precision maintained throughout calculation chain

## Data Integrity Tests
- [ ] DECIMAL(20,5) column stores 99999999999999.99999 without overflow
- [ ] No floating point errors: 0.10000 + 0.20000 = 0.30000 (exact)
- [ ] PostgreSQL transaction isolation: READ COMMITTED minimum for balance operations
