import type { FastifyRequest, FastifyReply } from 'fastify'
import type { SwishCallbackBody } from '../auth/swish.js'
import { prisma } from '../trpc/context.js'

// ---------------------------------------------------------------------------
// Payout callback types
// ---------------------------------------------------------------------------

interface SwishPayoutCallbackBody {
  payoutInstructionUUID: string
  status: 'PAID' | 'FAILED' | 'ERROR'
  errorMessage?: string
  datePaid?: string
}

/**
 * Handles incoming Swish callbacks for marketplace order payments.
 *
 * On PAID: atomically updates MarketplacePayment status=PAID, Order status=PAID
 * with paidAt=now(), and marks the Listing as SOLD.
 *
 * On DECLINED/ERROR: updates the MarketplacePayment status accordingly.
 *
 * Returns true if the callback was handled, false if the payment was not found.
 */
async function handleMarketplaceCallback(body: SwishCallbackBody): Promise<boolean> {
  const payment = await prisma.marketplacePayment.findUnique({
    where: { swishPaymentId: body.id },
    include: { order: true },
  })

  if (!payment) {
    return false
  }

  if (payment.status !== 'PENDING') {
    // Already processed — idempotent response
    return true
  }

  if (body.status === 'PAID') {
    await prisma.$transaction([
      prisma.marketplacePayment.update({
        where: { id: payment.id },
        data: { status: 'PAID' },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      }),
      prisma.listing.update({
        where: { id: payment.order.listingId },
        data: { status: 'SOLD' },
      }),
    ])
  } else if (body.status === 'DECLINED') {
    await prisma.marketplacePayment.update({
      where: { id: payment.id },
      data: { status: 'DECLINED' },
    })
  } else if (body.status === 'ERROR') {
    await prisma.marketplacePayment.update({
      where: { id: payment.id },
      data: { status: 'ERROR' },
    })
  }

  return true
}

/**
 * Fastify route handler for POST /api/marketplace/swish-callback.
 * Registered in server.ts alongside other Swish callback routes.
 */
export async function marketplaceCallbackHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = request.body as SwishCallbackBody

  if (!body || !body.id || !body.status) {
    return reply.status(400).send({ error: 'Invalid callback body' })
  }

  const handled = await handleMarketplaceCallback(body)
  if (!handled) {
    request.log.warn({ swishPaymentId: body.id }, 'Marketplace Swish callback received for unknown payment')
  }

  // Swish requires a 200 response to consider the callback delivered.
  return reply.status(200).send()
}

// ---------------------------------------------------------------------------
// Payout callback handler
// ---------------------------------------------------------------------------

/**
 * Handles incoming Swish payout callbacks.
 *
 * On PAID: updates SellerPayout status=PAID and sets completedAt.
 * On FAILED/ERROR: updates SellerPayout status=FAILED and stores errorMessage.
 */
async function handlePayoutCallback(body: SwishPayoutCallbackBody): Promise<boolean> {
  const payout = await prisma.sellerPayout.findUnique({
    where: { swishPayoutId: body.payoutInstructionUUID },
  })

  if (!payout) {
    return false
  }

  if (payout.status !== 'PENDING') {
    // Already processed — idempotent response
    return true
  }

  if (body.status === 'PAID') {
    await prisma.sellerPayout.update({
      where: { id: payout.id },
      data: {
        status: 'PAID',
        completedAt: new Date(),
      },
    })
  } else if (body.status === 'FAILED' || body.status === 'ERROR') {
    await prisma.sellerPayout.update({
      where: { id: payout.id },
      data: {
        status: 'FAILED',
        errorMessage: body.errorMessage ?? body.status,
      },
    })
  }

  return true
}

/**
 * Fastify route handler for POST /api/marketplace/payout-callback.
 */
export async function payoutCallbackHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = request.body as SwishPayoutCallbackBody

  if (!body || !body.payoutInstructionUUID || !body.status) {
    return reply.status(400).send({ error: 'Invalid callback body' })
  }

  const handled = await handlePayoutCallback(body)
  if (!handled) {
    request.log.warn(
      { swishPayoutId: body.payoutInstructionUUID },
      'Payout callback received for unknown payout',
    )
  }

  // Swish requires a 200 response to consider the callback delivered.
  return reply.status(200).send()
}
