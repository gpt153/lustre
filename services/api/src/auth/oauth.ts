import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Google
// ---------------------------------------------------------------------------

const googleJWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

export interface OAuthPayload {
  providerId: string
  email: string | undefined
  emailVerified: boolean
}

export async function verifyGoogleToken(idToken: string): Promise<OAuthPayload> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not set')

  const { payload } = await jwtVerify(idToken, googleJWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: clientId,
  })

  const sub = payload.sub
  if (!sub) throw new Error('Google token missing sub claim')

  return {
    providerId: sub,
    email: payload.email as string | undefined,
    emailVerified: (payload.email_verified as boolean | undefined) ?? false,
  }
}

// ---------------------------------------------------------------------------
// Apple
// ---------------------------------------------------------------------------

const appleJWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'))

export async function verifyAppleToken(identityToken: string): Promise<OAuthPayload> {
  const clientId = process.env.APPLE_CLIENT_ID
  if (!clientId) throw new Error('APPLE_CLIENT_ID is not set')

  const { payload } = await jwtVerify(identityToken, appleJWKS, {
    issuer: 'https://appleid.apple.com',
    audience: clientId,
  })

  const sub = payload.sub
  if (!sub) throw new Error('Apple token missing sub claim')

  return {
    providerId: sub,
    email: payload.email as string | undefined,
    emailVerified:
      (payload.email_verified as boolean | string | undefined) === true ||
      (payload.email_verified as string | undefined) === 'true',
  }
}

// ---------------------------------------------------------------------------
// Shared OAuth login helper
// ---------------------------------------------------------------------------

export interface OAuthLoginResult {
  userId: string
  isNewLink: boolean
}

export async function findOrLinkOAuthAccount(
  prisma: PrismaClient,
  provider: 'google' | 'apple',
  oauthPayload: OAuthPayload,
): Promise<OAuthLoginResult | { registrationRequired: true }> {
  // 1. Find by provider + providerId
  const existing = await prisma.oAuthAccount.findUnique({
    where: { provider_providerId: { provider, providerId: oauthPayload.providerId } },
  })
  if (existing) {
    return { userId: existing.userId, isNewLink: false }
  }

  // 2. Find user by email (if email provided)
  if (oauthPayload.email) {
    const userByEmail = await prisma.user.findUnique({ where: { email: oauthPayload.email } })
    if (userByEmail && userByEmail.status === 'ACTIVE') {
      // Link this OAuth account to the existing user
      await prisma.oAuthAccount.create({
        data: {
          userId: userByEmail.id,
          provider,
          providerId: oauthPayload.providerId,
          email: oauthPayload.email,
        },
      })
      return { userId: userByEmail.id, isNewLink: true }
    }
  }

  // 3. No user found — registration required
  return { registrationRequired: true }
}
