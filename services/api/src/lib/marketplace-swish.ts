import type { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Configuration — reuses the same env vars as src/auth/swish.ts
// ---------------------------------------------------------------------------

interface SwishConfig {
  merchantNumber: string
  apiUrl: string
  callbackUrl: string
  certPath: string
  certPassphrase: string
}

function getConfig(): SwishConfig {
  const merchantNumber = process.env.SWISH_MERCHANT_NUMBER
  const apiUrl = process.env.SWISH_API_URL
  const callbackUrl = process.env.SWISH_CALLBACK_URL
  const certPath = process.env.SWISH_CERT_PATH
  const certPassphrase = process.env.SWISH_CERT_PASSPHRASE

  if (!merchantNumber || !apiUrl || !callbackUrl || !certPath || !certPassphrase) {
    throw new Error(
      'Missing required Swish environment variables: SWISH_MERCHANT_NUMBER, SWISH_API_URL, SWISH_CALLBACK_URL, SWISH_CERT_PATH, SWISH_CERT_PASSPHRASE',
    )
  }

  return { merchantNumber, apiUrl, callbackUrl, certPath, certPassphrase }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SwishPaymentRequest {
  payeePaymentReference: string
  callbackUrl: string
  payerAlias?: string
  payeeAlias: string
  amount: string
  currency: string
  message: string
}

interface SwishPaymentResponse {
  id: string
  paymentRequestToken: string
}

// ---------------------------------------------------------------------------
// mTLS API call — same pattern as src/auth/swish.ts
// ---------------------------------------------------------------------------

async function callSwishApi(
  config: SwishConfig,
  payload: SwishPaymentRequest,
): Promise<SwishPaymentResponse> {
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

  const body = JSON.stringify(payload)
  const url = `${config.apiUrl}/paymentrequests`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    // @ts-expect-error — node-fetch / native fetch accepts agent via dispatcher;
    // when running on Node 18+ with native fetch we pass agent via the undici
    // compatible interface. For environments using node-fetch this is also valid.
    agent,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Swish API error (${response.status}): ${errorText}`)
  }

  // Swish returns 201 Created with no body; the payment ID is in the Location
  // header and the token is in the PaymentRequestToken header.
  const location = response.headers.get('Location') ?? ''
  const paymentRequestToken = response.headers.get('PaymentRequestToken') ?? ''

  // Location format: https://.../paymentrequests/{id}
  const id = location.split('/').at(-1) ?? ''

  if (!id) {
    throw new Error('Swish API did not return a payment request ID in the Location header')
  }

  return { id, paymentRequestToken }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates a Swish payment request for a marketplace order and persists a
 * MarketplacePayment record with status PENDING.
 *
 * Validates that:
 * - The order exists and is in PLACED status
 * - The requesting user is the buyer of the order
 *
 * Returns the Swish payment ID and the token needed to open the Swish app.
 */
export async function createOrderPaymentRequest(
  prisma: PrismaClient,
  orderId: string,
  buyerId: string,
  payerPhoneNumber?: string,
): Promise<{ swishPaymentId: string; paymentRequestToken: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  if (order.buyerId !== buyerId) {
    throw new Error('Only the buyer can initiate payment for this order')
  }

  if (order.status !== 'PLACED') {
    throw new Error(`Order must be in PLACED status to initiate payment (current: ${order.status})`)
  }

  const config = getConfig()

  // Convert öre to SEK and format as "X.XX"
  const amountSEK = order.amountSEK / 100
  const amountStr = amountSEK.toFixed(2)

  const payload: SwishPaymentRequest = {
    payeePaymentReference: orderId,
    callbackUrl: config.callbackUrl,
    payeeAlias: config.merchantNumber,
    amount: amountStr,
    currency: 'SEK',
    message: 'Lustre Marketplace \u2014 k\u00f6p',
    ...(payerPhoneNumber ? { payerAlias: payerPhoneNumber } : {}),
  }

  const swishResponse = await callSwishApi(config, payload)

  await prisma.marketplacePayment.create({
    data: {
      orderId,
      swishPaymentId: swishResponse.id,
      swishToken: swishResponse.paymentRequestToken,
      amountSEK: order.amountSEK,
      status: 'PENDING',
      ...(payerPhoneNumber ? { payerAlias: payerPhoneNumber } : {}),
    },
  })

  return {
    swishPaymentId: swishResponse.id,
    paymentRequestToken: swishResponse.paymentRequestToken,
  }
}
