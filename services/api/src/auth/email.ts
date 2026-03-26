import bcryptjs from 'bcryptjs'
import { randomBytes, createHash } from 'crypto'

const BCRYPT_COST = 12

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, BCRYPT_COST)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

export function generateResetToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  return { token, tokenHash, expiresAt }
}

export function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
