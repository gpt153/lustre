import type { FastifyRequest, FastifyReply } from 'fastify'

export interface ClientVersion {
  platform: 'ios' | 'android' | 'web'
  version: string
}

// Env vars: MIN_CLIENT_VERSION_IOS, MIN_CLIENT_VERSION_ANDROID, MIN_CLIENT_VERSION_WEB
function getMinVersion(platform: string): string | null {
  switch (platform) {
    case 'ios': return process.env.MIN_CLIENT_VERSION_IOS || null
    case 'android': return process.env.MIN_CLIENT_VERSION_ANDROID || null
    case 'web': return process.env.MIN_CLIENT_VERSION_WEB || null
    default: return null
  }
}

function getUpdateUrl(platform: string): string {
  switch (platform) {
    case 'ios': return 'https://apps.apple.com/app/lustre/id0' // Placeholder
    case 'android': return 'https://play.google.com/store/apps/details?id=com.lustre.app' // Placeholder
    default: return 'https://app.lovelustre.com'
  }
}

/**
 * Compare semver strings. Returns:
 * -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const na = pa[i] ?? 0
    const nb = pb[i] ?? 0
    if (na < nb) return -1
    if (na > nb) return 1
  }
  return 0
}

/**
 * Parse X-Client-Version header: "ios/1.2.0" → { platform: "ios", version: "1.2.0" }
 */
export function parseClientVersion(header: string | undefined): ClientVersion | null {
  if (!header) return null
  const match = header.match(/^(ios|android|web)\/(\d+\.\d+\.\d+)$/)
  if (!match) return null
  return { platform: match[1] as ClientVersion['platform'], version: match[2] }
}

// Paths exempt from version checking (not from app clients)
const EXEMPT_PATHS = [
  '/health',
  '/swish/callback',
  '/api/marketplace/swish-callback',
  '/api/marketplace/payout-callback',
  '/api/payments/swish-recurring-callback',
  '/api/payments/segpay-callback',
  '/api/events/ticket-callback',
  '/api/consent/mediaconvert-webhook',
  '/api/auth/migrate-session',
]

export function versionCheckHook(request: FastifyRequest, reply: FastifyReply, done: () => void): void {
  // Skip exempt paths
  if (EXEMPT_PATHS.some(p => request.url.startsWith(p))) {
    done()
    return
  }

  const header = request.headers['x-client-version'] as string | undefined
  const clientVersion = parseClientVersion(header)

  // Attach to request for downstream use
  ;(request as any).clientVersion = clientVersion

  // No header = backward compatible, allow through
  if (!clientVersion) {
    done()
    return
  }

  const minVersion = getMinVersion(clientVersion.platform)
  if (!minVersion) {
    done()
    return
  }

  if (compareSemver(clientVersion.version, minVersion) < 0) {
    reply.status(426).send({
      error: 'upgrade_required',
      minVersion,
      currentVersion: clientVersion.version,
      platform: clientVersion.platform,
      updateUrl: getUpdateUrl(clientVersion.platform),
    })
    return
  }

  done()
}
