import type { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Configuration — reuse the same Swish mTLS config as auth/swish.ts
// ---------------------------------------------------------------------------

interface SwishConfig {
  apiUrl: string
  certPath: string
  certPassphrase: string
}

function getConfig(): SwishConfig {
  const apiUrl = process.env.SWISH_API_URL
  const certPath = process.env.SWISH_CERT_PATH
  const certPassphrase = process.env.SWISH_CERT_PASSPHRASE

  if (!apiUrl || !certPath || !certPassphrase) {
    throw new Error(
      'Missing required Swish environment variables: SWISH_API_URL, SWISH_CERT_PATH, SWISH_CERT_PASSPHRASE',
    )
  }

  return { apiUrl, certPath, certPassphrase }
}

// ---------------------------------------------------------------------------
// Payout payload type
// ---------------------------------------------------------------------------

interface SwishPayoutPayload {
  payoutInstructionUUID: string
  payeeAlias: string
  amount: string
  currency: string
  message: string
}

// ---------------------------------------------------------------------------
// Internal helper — POST to Swish Payout API with mTLS
// ---------------------------------------------------------------------------

async function callSwishPayoutApi(
  config: SwishConfig,
  payload: SwishPayoutPayload,
): Promise<string | null> {
  const { readFileSync } = await import('fs')
  const https = await import('https')

  const cert = readFileSync(config.certPath)

  const agent = new https.Agent({
    pfx: cert,
    passphrase: config.certPassphrase,
    ...(process.env.SWISH_CA_PATH
      ? { ca: readFileSync(process.env.SWISH_CA_PATH) }
      : {}),
  })

  const url = `${config.apiUrl}/payouts`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    // @ts-expect-error — node-fetch / native fetch accepts agent via dispatcher
    agent,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Swish Payout API error (${response.status}): ${errorText}`)
  }

  // Swish returns 201 Created; payout ID is in the Location header
  // Location format: https://.../payouts/{id}
  const location = response.headers.get('Location') ?? ''
  const payoutId = location.split('/').at(-1) ?? ''

  return payoutId || null
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initiates a Swish payout to the seller for a delivered order.
 *
 * Idempotent — if a SellerPayout already exists for the order, returns the
 * existing record without creating a duplicate payout.
 *
 * Throws if:
 *   - The order does not exist
 *   - The seller has no Swish number registered
 *   - The Swish Payout API returns an error
 */
export async function initiateSellerPayout(
  prisma: PrismaClient,
  orderId: string,
): Promise<{
  id: string
  orderId: string
  sellerId: string
  swishPayoutId: string | null
  amountSEK: number
  status: string
  errorMessage: string | null
  initiatedAt: Date
  completedAt: Date | null
}> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { seller: true },
  })

  if (!order) {
    throw new Error(`Order not found: ${orderId}`)
  }

  // Idempotency — if payout already exists, return it
  const existingPayout = await prisma.sellerPayout.findUnique({
    where: { orderId },
  })

  if (existingPayout) {
    return existingPayout
  }

  const sellerSwishNumber = await prisma.sellerSwishNumber.findUnique({
    where: { userId: order.sellerId },
  })

  if (!sellerSwishNumber) {
    throw new Error('Seller has no Swish number registered')
  }

  const netAmount = order.amountSEK - order.commissionSEK

  const config = getConfig()

  const payoutInstructionUUID = crypto.randomUUID()

  const payload: SwishPayoutPayload = {
    payoutInstructionUUID,
    payeeAlias: sellerSwishNumber.swishNumber,
    amount: (netAmount / 100).toFixed(2),
    currency: 'SEK',
    message: 'Lustre Marketplace — utbetalning',
  }

  const swishPayoutId = await callSwishPayoutApi(config, payload)

  const payout = await prisma.sellerPayout.create({
    data: {
      orderId,
      sellerId: order.sellerId,
      swishPayoutId,
      amountSEK: netAmount,
      status: 'PENDING',
    },
  })

  return payout
}
