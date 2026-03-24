import { SignJWT, jwtVerify } from 'jose'
import { createHash } from 'crypto'

const getSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

const ALGORITHM = 'HS256'
const ACCESS_TOKEN_EXPIRY = '24h'
const REFRESH_TOKEN_EXPIRY = '30d'

export async function generateAccessToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, type: 'access' })
    .setProtectedHeader({ alg: ALGORITHM })
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(getSecret())
}

export async function generateRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, type: 'refresh' })
    .setProtectedHeader({ alg: ALGORITHM })
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(getSecret())
}

export async function verifyToken(
  token: string,
): Promise<{ userId: string; type: 'access' | 'refresh' }> {
  try {
    const verified = await jwtVerify(token, getSecret())
    const payload = verified.payload

    const userId = payload.sub
    const type = payload.type

    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid token: missing or invalid sub claim')
    }

    if (type !== 'access' && type !== 'refresh') {
      throw new Error('Invalid token: invalid type claim')
    }

    return { userId, type }
  } catch (error) {
    throw new Error(`Token verification failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
