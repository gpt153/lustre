// Environment variables must be set before importing modules that read them at call time.
// jwt.ts and crypto.ts read env vars inside functions (not at module load), so this is safe.
process.env.JWT_SECRET = 'test-secret-key-at-least-32-chars-long!!'
process.env.ENCRYPTION_KEY = 'a'.repeat(64) // 32 bytes in hex

import { test, expect } from 'vitest'
import { generateAccessToken, generateRefreshToken, verifyToken, hashToken } from '../auth/jwt.js'
import { parsePersonnummer, hashPersonnummer, validateAge } from '../auth/personnummer.js'
import { encrypt, decrypt, encryptIdentity } from '../auth/crypto.js'

// ---------------------------------------------------------------------------
// JWT tests
// ---------------------------------------------------------------------------

test('generateAccessToken returns a string', async () => {
  const token = await generateAccessToken('user-123')
  expect(typeof token).toBe('string')
  expect(token.split('.')).toHaveLength(3) // JWT format
})

test('verifyToken decodes access token correctly', async () => {
  const token = await generateAccessToken('user-123')
  const decoded = await verifyToken(token)
  expect(decoded.userId).toBe('user-123')
  expect(decoded.type).toBe('access')
})

test('verifyToken decodes refresh token correctly', async () => {
  const token = await generateRefreshToken('user-456')
  const decoded = await verifyToken(token)
  expect(decoded.userId).toBe('user-456')
  expect(decoded.type).toBe('refresh')
})

test('verifyToken rejects malformed token', async () => {
  await expect(verifyToken('not-a-valid-jwt')).rejects.toThrow()
})

test('hashToken produces consistent SHA-256 hash', () => {
  const hash1 = hashToken('test-token')
  const hash2 = hashToken('test-token')
  expect(hash1).toBe(hash2)
  expect(hash1).toHaveLength(64) // SHA-256 hex
})

// ---------------------------------------------------------------------------
// Personnummer tests
// ---------------------------------------------------------------------------

test('parsePersonnummer normalizes 12-digit format', () => {
  expect(parsePersonnummer('199001011234')).toBe('199001011234')
})

test('parsePersonnummer normalizes 10-digit format', () => {
  const result = parsePersonnummer('9001011234')
  expect(result).toBe('199001011234')
})

test('parsePersonnummer handles separators', () => {
  const result = parsePersonnummer('900101-1234')
  expect(result).toBe('199001011234')
})

test('validateAge returns true for 18+ personnummer', () => {
  // Born in 2000, which is 26 years old in 2026
  expect(validateAge('200001011234')).toBe(true)
})

test('validateAge returns false for under-18 personnummer', () => {
  // Born in 2010, which is 16 in 2026
  expect(validateAge('201001011234')).toBe(false)
})

test('hashPersonnummer produces SHA-256 hash', () => {
  const hash = hashPersonnummer('199001011234')
  expect(hash).toHaveLength(64)
})

// ---------------------------------------------------------------------------
// Crypto tests
// ---------------------------------------------------------------------------

test('encrypt and decrypt round-trip', () => {
  const { encrypted, iv } = encrypt('Hello World')
  const decrypted = decrypt(encrypted, iv)
  expect(decrypted).toBe('Hello World')
})

test('encrypt produces different ciphertext each time (random IV)', () => {
  const r1 = encrypt('same text')
  const r2 = encrypt('same text')
  expect(r1.encrypted).not.toBe(r2.encrypted)
})

test('encryptIdentity encrypts all fields', () => {
  const result = encryptIdentity({
    firstName: 'Erik',
    lastName: 'Svensson',
    personnummer: '199001011234',
  })
  expect(result.encryptedFirstName).toBeTruthy()
  expect(result.encryptedLastName).toBeTruthy()
  expect(result.encryptedPersonnummer).toBeTruthy()
  expect(result.iv).toBeTruthy()
})

test('encryptIdentity values can be decrypted', () => {
  const identity = { firstName: 'Erik', lastName: 'Svensson', personnummer: '199001011234' }
  const result = encryptIdentity(identity)
  expect(decrypt(result.encryptedFirstName, result.iv)).toBe('Erik')
  expect(decrypt(result.encryptedLastName, result.iv)).toBe('Svensson')
  expect(decrypt(result.encryptedPersonnummer, result.iv)).toBe('199001011234')
})
