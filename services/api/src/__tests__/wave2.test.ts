// Environment variables must be set before importing modules that read them.
// (crypto.ts reads ENCRYPTION_KEY inside functions, so this ordering is safe.)
process.env.JWT_SECRET = 'test-secret-key-at-least-32-chars-long!!'
process.env.ENCRYPTION_KEY = 'aa'.repeat(32) // 64 hex chars = 32 bytes

import { describe, test, expect } from 'vitest'
import { encrypt, decrypt, encryptIdentity } from '../auth/crypto.js'
import { setDisplayName } from '../auth/anonymity.js'
import type { SwishCallbackBody, SwishPaymentResponse } from '../auth/swish.js'

// ---------------------------------------------------------------------------
// Anonymity — Identity Encryption (no plaintext leaks)
// ---------------------------------------------------------------------------

describe('Anonymity - Identity Encryption', () => {
  test('encryptIdentity: firstName is not stored as plaintext', () => {
    const result = encryptIdentity({ firstName: 'Erik', lastName: 'Svensson', personnummer: '199001011234' })
    expect(result.encryptedFirstName).not.toBe('Erik')
  })

  test('encryptIdentity: lastName is not stored as plaintext', () => {
    const result = encryptIdentity({ firstName: 'Erik', lastName: 'Svensson', personnummer: '199001011234' })
    expect(result.encryptedLastName).not.toBe('Svensson')
  })

  test('encryptIdentity: personnummer is not stored as plaintext', () => {
    const result = encryptIdentity({ firstName: 'Erik', lastName: 'Svensson', personnummer: '199001011234' })
    expect(result.encryptedPersonnummer).not.toBe('199001011234')
  })

  test('encryptIdentity: iv is present and looks like a hex string', () => {
    const result = encryptIdentity({ firstName: 'Erik', lastName: 'Svensson', personnummer: '199001011234' })
    expect(result.iv).toBeTruthy()
    expect(result.iv).toMatch(/^[0-9a-f]+$/i)
    // AES-GCM IV is 16 bytes = 32 hex chars
    expect(result.iv).toHaveLength(32)
  })

  test('encryptIdentity: all three fields share the same iv', () => {
    // The implementation generates one IV and uses it for all three fields.
    // This means all three can be decrypted with the single stored iv.
    const identity = { firstName: 'Anna', lastName: 'Lindqvist', personnummer: '198505152345' }
    const result = encryptIdentity(identity)
    // If decryption with the returned iv succeeds for all fields, the iv is shared.
    expect(decrypt(result.encryptedFirstName, result.iv)).toBe('Anna')
    expect(decrypt(result.encryptedLastName, result.iv)).toBe('Lindqvist')
    expect(decrypt(result.encryptedPersonnummer, result.iv)).toBe('198505152345')
  })

  test('encryptIdentity: two calls produce different ciphertext (random IV)', () => {
    const identity = { firstName: 'Erik', lastName: 'Svensson', personnummer: '199001011234' }
    const r1 = encryptIdentity(identity)
    const r2 = encryptIdentity(identity)
    expect(r1.encryptedFirstName).not.toBe(r2.encryptedFirstName)
    expect(r1.iv).not.toBe(r2.iv)
  })

  test('encryptIdentity: encrypted fields are non-empty hex strings', () => {
    const result = encryptIdentity({ firstName: 'X', lastName: 'Y', personnummer: '199001011234' })
    expect(result.encryptedFirstName).toMatch(/^[0-9a-f]+$/i)
    expect(result.encryptedLastName).toMatch(/^[0-9a-f]+$/i)
    expect(result.encryptedPersonnummer).toMatch(/^[0-9a-f]+$/i)
  })

  test('encryptIdentity: handles Swedish characters in names', () => {
    const identity = { firstName: 'Åsa', lastName: 'Öberg', personnummer: '198703033456' }
    const result = encryptIdentity(identity)
    expect(decrypt(result.encryptedFirstName, result.iv)).toBe('Åsa')
    expect(decrypt(result.encryptedLastName, result.iv)).toBe('Öberg')
  })
})

// ---------------------------------------------------------------------------
// Anonymity — Display Name Validation (via setDisplayName with a stub prisma)
//
// validateDisplayName is not exported, but it runs before any DB call.
// For invalid names it throws immediately; we never reach the DB.
// We pass a minimal prisma stub that would error loudly if ever touched.
// ---------------------------------------------------------------------------

// Minimal stub — any property access on this throws, so a test that
// reaches the DB call will fail rather than silently pass.
const stubPrisma = new Proxy({} as any, {
  get(_target, prop) {
    throw new Error(`Unexpected prisma access: .${String(prop)} — validation should have thrown first`)
  },
})

describe('Anonymity - Display Name Validation', () => {
  test('rejects names shorter than 3 characters', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'ab')).rejects.toThrow(
      'Display name must be 3-30 characters',
    )
  })

  test('rejects empty string', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', '')).rejects.toThrow(
      'Display name must be 3-30 characters',
    )
  })

  test('rejects names longer than 30 characters', async () => {
    const longName = 'a'.repeat(31)
    await expect(setDisplayName(stubPrisma, 'user-1', longName)).rejects.toThrow(
      'Display name must be 3-30 characters',
    )
  })

  test('accepts names of exactly 3 characters (boundary)', async () => {
    // 3 chars is the minimum valid length — validation should not throw.
    // The stub prisma will throw when the DB is reached, so we expect the
    // stub's error (meaning validation passed) not the validation error.
    await expect(setDisplayName(stubPrisma, 'user-1', 'abc')).rejects.toThrow(
      'Unexpected prisma access',
    )
  })

  test('accepts names of exactly 30 characters (boundary)', async () => {
    const maxName = 'a'.repeat(30)
    await expect(setDisplayName(stubPrisma, 'user-1', maxName)).rejects.toThrow(
      'Unexpected prisma access',
    )
  })

  test('rejects names with special characters (e.g. @)', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'user@name')).rejects.toThrow(
      'Display name can only contain letters, numbers, underscores, and Swedish characters',
    )
  })

  test('rejects names with spaces', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'my name')).rejects.toThrow(
      'Display name can only contain letters, numbers, underscores, and Swedish characters',
    )
  })

  test('rejects names with hyphens', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'my-name')).rejects.toThrow(
      'Display name can only contain letters, numbers, underscores, and Swedish characters',
    )
  })

  test('accepts names with underscores', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'my_name')).rejects.toThrow(
      'Unexpected prisma access',
    )
  })

  test('accepts names with Swedish characters åäö', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'åsaöberg')).rejects.toThrow(
      'Unexpected prisma access',
    )
  })

  test('accepts names with uppercase Swedish characters ÅÄÖ', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'ÅsaÖberg')).rejects.toThrow(
      'Unexpected prisma access',
    )
  })

  test('rejects reserved word: admin', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'admin')).rejects.toThrow(
      'Display name contains reserved words',
    )
  })

  test('rejects reserved word: moderator', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'moderator')).rejects.toThrow(
      'Display name contains reserved words',
    )
  })

  test('rejects reserved word: support', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'support')).rejects.toThrow(
      'Display name contains reserved words',
    )
  })

  test('rejects reserved word: official', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'official')).rejects.toThrow(
      'Display name contains reserved words',
    )
  })

  test('rejects reserved word: system', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'system')).rejects.toThrow(
      'Display name contains reserved words',
    )
  })

  test('rejects reserved word: root', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'root')).rejects.toThrow(
      'Display name contains reserved words',
    )
  })

  test('rejects reserved word: administrator', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'administrator')).rejects.toThrow(
      'Display name contains reserved words',
    )
  })

  test('rejects reserved words case-insensitively (Admin)', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'Admin')).rejects.toThrow(
      'Display name contains reserved words',
    )
  })

  test('rejects reserved words case-insensitively (MODERATOR)', async () => {
    await expect(setDisplayName(stubPrisma, 'user-1', 'MODERATOR')).rejects.toThrow(
      'Display name contains reserved words',
    )
  })
})

// ---------------------------------------------------------------------------
// Swish — Types and runtime shape
// ---------------------------------------------------------------------------

describe('Swish - SwishCallbackBody type', () => {
  test('accepts a valid PAID callback body', () => {
    const body: SwishCallbackBody = {
      id: 'abc123',
      payeePaymentReference: 'user-456',
      callbackUrl: 'https://example.com/callback',
      payeeAlias: '1234679304',
      amount: 10,
      currency: 'SEK',
      status: 'PAID',
      dateCreated: '2026-03-24T12:00:00.000Z',
    }
    expect(body.status).toBe('PAID')
    expect(body.amount).toBe(10)
    expect(body.currency).toBe('SEK')
  })

  test('accepts DECLINED status', () => {
    const body: SwishCallbackBody = {
      id: 'abc124',
      payeePaymentReference: 'user-457',
      callbackUrl: 'https://example.com/callback',
      payeeAlias: '1234679304',
      amount: 10,
      currency: 'SEK',
      status: 'DECLINED',
      dateCreated: '2026-03-24T12:01:00.000Z',
    }
    expect(body.status).toBe('DECLINED')
  })

  test('accepts ERROR status', () => {
    const body: SwishCallbackBody = {
      id: 'abc125',
      payeePaymentReference: 'user-458',
      callbackUrl: 'https://example.com/callback',
      payeeAlias: '1234679304',
      amount: 10,
      currency: 'SEK',
      status: 'ERROR',
      dateCreated: '2026-03-24T12:02:00.000Z',
      errorCode: 'ACMT03',
      errorMessage: 'Account does not exist',
    }
    expect(body.status).toBe('ERROR')
    expect(body.errorCode).toBe('ACMT03')
    expect(body.errorMessage).toBe('Account does not exist')
  })

  test('accepts CREATED status', () => {
    const body: SwishCallbackBody = {
      id: 'abc126',
      payeePaymentReference: 'user-459',
      callbackUrl: 'https://example.com/callback',
      payeeAlias: '1234679304',
      amount: 10,
      currency: 'SEK',
      status: 'CREATED',
      dateCreated: '2026-03-24T12:03:00.000Z',
    }
    expect(body.status).toBe('CREATED')
  })

  test('optional fields (payerAlias, message, datePaid, paymentReference) can be omitted', () => {
    const body: SwishCallbackBody = {
      id: 'abc127',
      payeePaymentReference: 'user-460',
      callbackUrl: 'https://example.com/callback',
      payeeAlias: '1234679304',
      amount: 10,
      currency: 'SEK',
      status: 'PAID',
      dateCreated: '2026-03-24T12:04:00.000Z',
    }
    expect(body.payerAlias).toBeUndefined()
    expect(body.message).toBeUndefined()
    expect(body.datePaid).toBeUndefined()
    expect(body.paymentReference).toBeUndefined()
  })

  test('optional fields can be set when present', () => {
    const body: SwishCallbackBody = {
      id: 'abc128',
      payeePaymentReference: 'user-461',
      paymentReference: 'REF001',
      callbackUrl: 'https://example.com/callback',
      payerAlias: '0701234567',
      payeeAlias: '1234679304',
      amount: 10,
      currency: 'SEK',
      message: 'Lustre — aktivering av konto',
      status: 'PAID',
      dateCreated: '2026-03-24T12:05:00.000Z',
      datePaid: '2026-03-24T12:05:30.000Z',
    }
    expect(body.payerAlias).toBe('0701234567')
    expect(body.message).toBe('Lustre — aktivering av konto')
    expect(body.datePaid).toBe('2026-03-24T12:05:30.000Z')
    expect(body.paymentReference).toBe('REF001')
  })
})

describe('Swish - SwishPaymentResponse type', () => {
  test('holds id and paymentRequestToken', () => {
    const response: SwishPaymentResponse = {
      id: 'pay-001',
      paymentRequestToken: 'token-xyz',
    }
    expect(response.id).toBe('pay-001')
    expect(response.paymentRequestToken).toBe('token-xyz')
  })
})
