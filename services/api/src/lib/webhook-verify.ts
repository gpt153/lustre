import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Verifies a Swish webhook signature using HMAC-SHA256.
 *
 * In development (NODE_ENV !== 'production'), verification is skipped when
 * SWISH_WEBHOOK_SECRET is not set, so local testing works without a real secret.
 *
 * Returns true when:
 *  - NODE_ENV !== 'production' AND SWISH_WEBHOOK_SECRET is not set
 *  - The computed HMAC-SHA256(rawBody, SWISH_WEBHOOK_SECRET) matches the header
 *
 * Returns false when:
 *  - The signature header is missing or malformed
 *  - The computed signature does not match (constant-time comparison)
 */
export function verifySwishWebhook(
  rawBody: string,
  signatureHeader: string | undefined,
): boolean {
  const secret = process.env.SWISH_WEBHOOK_SECRET

  // Skip verification in non-production when no secret is configured
  if (process.env.NODE_ENV !== 'production' && !secret) {
    return true
  }

  if (!secret) {
    return false
  }

  if (!signatureHeader) {
    return false
  }

  const computed = createHmac('sha256', secret).update(rawBody).digest('hex')

  // Normalise: Swish may send the header as "sha256=<hex>" or plain hex
  const provided = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice(7)
    : signatureHeader

  if (provided.length !== computed.length) {
    return false
  }

  return timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(provided, 'hex'))
}

/**
 * Verifies a Segpay webhook signature using HMAC-SHA256.
 *
 * In development (NODE_ENV !== 'production'), verification is skipped when
 * SEGPAY_WEBHOOK_SECRET is not set.
 *
 * Returns true when:
 *  - NODE_ENV !== 'production' AND SEGPAY_WEBHOOK_SECRET is not set
 *  - The computed HMAC-SHA256(rawBody, SEGPAY_WEBHOOK_SECRET) matches the header
 */
export function verifySegpayWebhook(
  rawBody: string,
  signatureHeader: string | undefined,
): boolean {
  const secret = process.env.SEGPAY_WEBHOOK_SECRET

  // Skip verification in non-production when no secret is configured
  if (process.env.NODE_ENV !== 'production' && !secret) {
    return true
  }

  if (!secret) {
    return false
  }

  if (!signatureHeader) {
    return false
  }

  const computed = createHmac('sha256', secret).update(rawBody).digest('hex')

  // Normalise: Segpay may send as "sha256=<hex>" or plain hex
  const provided = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice(7)
    : signatureHeader

  if (provided.length !== computed.length) {
    return false
  }

  return timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(provided, 'hex'))
}
