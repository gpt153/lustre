import type { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Configuration
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

export interface SwishPaymentResponse {
  id: string
  paymentRequestToken: string
}

export interface SwishCallbackBody {
  id: string
  payeePaymentReference: string
  paymentReference?: string
  callbackUrl: string
  payerAlias?: string
  payeeAlias: string
  amount: number
  currency: string
  message?: string
  status: 'CREATED' | 'PAID' | 'DECLINED' | 'ERROR'
  dateCreated: string
  datePaid?: string
  errorCode?: string
  errorMessage?: string
}

// ---------------------------------------------------------------------------
// Payment amount constant
// ---------------------------------------------------------------------------

const PAYMENT_AMOUNT = '10.00'
const PAYMENT_CURRENCY = 'SEK'
const PAYMENT_MESSAGE = 'Lustre — aktivering av konto'

// ---------------------------------------------------------------------------
// API call
// ---------------------------------------------------------------------------

/**
 * Creates a Swish payment request via the Swish Handel API (mTLS).
 * The API returns a Location header containing the payment request ID and
 * a PaymentRequestToken header for opening the Swish app.
 *
 * mTLS is performed using node:https with the .p12 certificate loaded from disk.
 * In environments where the certificate is unavailable this will throw — ensure
 * SWISH_CERT_PATH points to a valid .p12 file at runtime.
 */
async function callSwishApi(
  config: SwishConfig,
  payload: SwishPaymentRequest,
): Promise<SwishPaymentResponse> {
  // Dynamically import fs and https so the module can be imported safely in
  // environments where the certificate file doesn't exist yet (e.g., CI type checks).
  const { readFileSync } = await import('fs')
  const https = await import('https')

  const cert = readFileSync(config.certPath)

  const agent = new https.Agent({
    pfx: cert,
    passphrase: config.certPassphrase,
    // The Swish test environment uses a self-signed root CA; in production the
    // Swish root is trusted by default. Set SWISH_CA_PATH to override.
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
 * Creates a Swish payment request for 10 SEK and persists it to the database.
 * Returns the Swish payment ID and the token needed to open the Swish app.
 */
export async function createPaymentRequest(
  prisma: PrismaClient,
  userId: string,
  payerPhoneNumber?: string,
): Promise<SwishPaymentResponse> {
  const config = getConfig()

  const payload: SwishPaymentRequest = {
    payeePaymentReference: userId,
    callbackUrl: config.callbackUrl,
    payeeAlias: config.merchantNumber,
    amount: PAYMENT_AMOUNT,
    currency: PAYMENT_CURRENCY,
    message: PAYMENT_MESSAGE,
    ...(payerPhoneNumber ? { payerAlias: payerPhoneNumber } : {}),
  }

  const swishResponse = await callSwishApi(config, payload)

  // Persist the pending payment record
  await prisma.payment.create({
    data: {
      userId,
      swishPaymentId: swishResponse.id,
      amount: PAYMENT_AMOUNT,
      currency: PAYMENT_CURRENCY,
      status: 'PENDING',
      swishToken: swishResponse.paymentRequestToken,
    },
  })

  return swishResponse
}

/**
 * Handles an incoming Swish callback. Updates the payment status and, when the
 * payment is PAID, activates the user account (PENDING → ACTIVE).
 *
 * Returns true if the callback was handled, false if the payment was not found.
 */
export async function handleSwishCallback(
  prisma: PrismaClient,
  body: SwishCallbackBody,
): Promise<boolean> {
  const payment = await prisma.payment.findUnique({
    where: { swishPaymentId: body.id },
  })

  if (!payment) {
    return false
  }

  if (payment.status !== 'PENDING') {
    // Already processed — idempotent response
    return true
  }

  if (body.status === 'PAID') {
    // Atomically update payment and activate the user in a transaction
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          completedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: payment.userId },
        data: { status: 'ACTIVE' },
      }),
    ])
  } else if (body.status === 'DECLINED') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'DECLINED' },
    })
  } else if (body.status === 'ERROR') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'ERROR' },
    })
  }

  return true
}
