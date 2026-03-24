import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }
  const keyBuffer = Buffer.from(key, 'hex')
  if (keyBuffer.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte hex string (64 hex characters)')
  }
  return keyBuffer
}

function encryptWithIv(plaintext: string, iv: Buffer): string {
  const key = getEncryptionKey()
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  // Concatenate authTag + encrypted, encode as hex
  return Buffer.concat([authTag, encrypted]).toString('hex')
}

export function encrypt(plaintext: string): { encrypted: string; iv: string } {
  const iv = randomBytes(16)
  const encrypted = encryptWithIv(plaintext, iv)
  return { encrypted, iv: iv.toString('hex') }
}

export function decrypt(encrypted: string, iv: string): string {
  const key = getEncryptionKey()
  const ivBuffer = Buffer.from(iv, 'hex')
  const data = Buffer.from(encrypted, 'hex')
  // First 16 bytes are the authTag, rest is ciphertext
  const authTag = data.subarray(0, 16)
  const ciphertext = data.subarray(16)
  const decipher = createDecipheriv(ALGORITHM, key, ivBuffer)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return decrypted.toString('utf8')
}

export function encryptIdentity(identity: {
  firstName: string
  lastName: string
  personnummer: string
}): {
  encryptedFirstName: string
  encryptedLastName: string
  encryptedPersonnummer: string
  iv: string
} {
  const iv = randomBytes(16)
  return {
    encryptedFirstName: encryptWithIv(identity.firstName, iv),
    encryptedLastName: encryptWithIv(identity.lastName, iv),
    encryptedPersonnummer: encryptWithIv(identity.personnummer, iv),
    iv: iv.toString('hex'),
  }
}
