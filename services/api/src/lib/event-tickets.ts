import type { PrismaClient } from '@prisma/client'
import type { SwishCallbackBody } from '../auth/swish.js'

// ---------------------------------------------------------------------------
// Types (re-export)
// ---------------------------------------------------------------------------

export type { SwishCallbackBody } from '../auth/swish.js'

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
// Types (internal)
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
 * Creates a Swish payment request for an event ticket.
 * Validates that the event exists, is published, and has a price.
 * Returns the Swish payment ID and token needed to open the Swish app.
 */
export async function createTicketPaymentRequest(
  prisma: PrismaClient,
  userId: string,
  eventId: string,
  payerPhoneNumber?: string,
): Promise<{ swishPaymentId: string; paymentRequestToken: string }> {
  const config = getConfig()

  // Fetch event and validate
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  })

  if (!event) {
    throw new Error('Event not found')
  }

  if (event.status !== 'PUBLISHED') {
    throw new Error('Event is not published')
  }

  if (!event.price || event.price.toString() === '0') {
    throw new Error('Event has no price set or price is zero')
  }

  // Check for existing valid ticket for this user + event
  const existingTicket = await prisma.eventTicket.findFirst({
    where: {
      eventId,
      userId,
      status: 'VALID',
    },
  })

  if (existingTicket) {
    throw new Error('User already has a valid ticket for this event')
  }

  // Create Swish payment request with event-specific details
  const callbackBaseUrl = process.env.SWISH_TICKET_CALLBACK_URL ?? process.env.SWISH_CALLBACK_URL
  const callbackUrl = callbackBaseUrl?.replace('/auth', '') ?? process.env.SWISH_CALLBACK_URL

  const payload: SwishPaymentRequest = {
    payeePaymentReference: eventId,
    callbackUrl: `${callbackUrl}/events/ticket-callback`,
    payeeAlias: config.merchantNumber,
    amount: event.price.toString(),
    currency: event.currency,
    message: `Lustre — biljett: ${event.title.substring(0, 50)}`,
    ...(payerPhoneNumber ? { payerAlias: payerPhoneNumber } : {}),
  }

  const swishResponse = await callSwishApi(config, payload)

  // Create EventTicket with VALID status (pending confirmation)
  await prisma.eventTicket.create({
    data: {
      eventId,
      userId,
      swishPaymentId: swishResponse.id,
      status: 'VALID',
      pricePaid: event.price,
      currency: event.currency,
    },
  })

  return {
    swishPaymentId: swishResponse.id,
    paymentRequestToken: swishResponse.paymentRequestToken,
  }
}

/**
 * Handles an incoming Swish callback for a ticket payment.
 * On PAID: upserts EventAttendee with GOING status.
 * On DECLINED/ERROR: marks ticket as CANCELLED.
 * Returns true if handled, false if ticket not found.
 */
export async function handleTicketPaymentCallback(
  prisma: PrismaClient,
  body: SwishCallbackBody,
): Promise<boolean> {
  const ticket = await prisma.eventTicket.findUnique({
    where: { swishPaymentId: body.id },
  })

  if (!ticket) {
    return false
  }

  // Check idempotency: if status is not VALID, assume already processed
  if (ticket.status !== 'VALID') {
    return true
  }

  if (body.status === 'PAID') {
    // Atomically upsert EventAttendee and keep ticket VALID
    await prisma.$transaction([
      prisma.eventAttendee.upsert({
        where: {
          eventId_userId: {
            eventId: ticket.eventId,
            userId: ticket.userId,
          },
        },
        create: {
          eventId: ticket.eventId,
          userId: ticket.userId,
          status: 'GOING',
        },
        update: {
          status: 'GOING',
        },
      }),
    ])
    // Ticket remains VALID
  } else if (body.status === 'DECLINED') {
    await prisma.eventTicket.update({
      where: { id: ticket.id },
      data: { status: 'CANCELLED' },
    })
  } else if (body.status === 'ERROR') {
    await prisma.eventTicket.update({
      where: { id: ticket.id },
      data: { status: 'CANCELLED' },
    })
  }

  return true
}
