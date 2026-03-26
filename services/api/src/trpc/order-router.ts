import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { createOrderPaymentRequest } from '../lib/marketplace-swish.js'
import { initiateSellerPayout } from '../lib/seller-payout.js'

const shippingOptionSchema = z.enum(['STANDARD_POST', 'EXPRESS_POST', 'PICKUP'])

export const orderRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        shippingOption: shippingOptionSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.listing.findUnique({
        where: { id: input.listingId },
      })

      if (!listing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Listing not found',
        })
      }

      if (listing.status !== 'ACTIVE') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Listing is not active',
        })
      }

      if (listing.sellerId === ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot place an order on your own listing',
        })
      }

      const commissionSEK = Math.round(listing.price * 0.1)

      const order = await ctx.prisma.order.create({
        data: {
          listingId: input.listingId,
          buyerId: ctx.userId,
          sellerId: listing.sellerId,
          amountSEK: listing.price,
          commissionSEK,
          status: 'PLACED',
          shippingOption: input.shippingOption,
        },
      })

      return order
    }),

  markShipped: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        trackingNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: input.orderId },
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        })
      }

      if (order.sellerId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the seller can mark an order as shipped',
        })
      }

      if (order.status !== 'PAID') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Order must be in PAID status to mark as shipped',
        })
      }

      const now = new Date()
      const autoConfirmAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      const updated = await ctx.prisma.order.update({
        where: { id: input.orderId },
        data: {
          status: 'SHIPPED',
          shippedAt: now,
          autoConfirmAt,
          trackingNumber: input.trackingNumber,
        },
      })

      return updated
    }),

  confirmDelivery: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: input.orderId },
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        })
      }

      if (order.buyerId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the buyer can confirm delivery',
        })
      }

      if (order.status !== 'SHIPPED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Order must be in SHIPPED status to confirm delivery',
        })
      }

      const updated = await ctx.prisma.order.update({
        where: { id: input.orderId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
        },
      })

      initiateSellerPayout(ctx.prisma, input.orderId).catch((err) => {
        console.error('Seller payout failed:', err)
      })

      return updated
    }),

  getStatus: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: input.orderId },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              images: {
                select: {
                  url: true,
                },
                orderBy: { order: 'asc' },
                take: 1,
              },
            },
          },
          buyer: {
            select: {
              id: true,
              displayName: true,
            },
          },
          seller: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        })
      }

      if (order.buyerId !== ctx.userId && order.sellerId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this order',
        })
      }

      return {
        id: order.id,
        listingId: order.listingId,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        status: order.status,
        amountSEK: order.amountSEK,
        commissionSEK: order.commissionSEK,
        shippingOption: order.shippingOption,
        trackingNumber: order.trackingNumber,
        placedAt: order.placedAt,
        paidAt: order.paidAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        completedAt: order.completedAt,
        autoConfirmAt: order.autoConfirmAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        listing: {
          id: order.listing.id,
          title: order.listing.title,
          image: order.listing.images[0]?.url ?? null,
        },
        buyer: {
          id: order.buyer.id,
          displayName: order.buyer.displayName,
        },
        seller: {
          id: order.seller.id,
          displayName: order.seller.displayName,
        },
      }
    }),

  initiatePayment: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        phoneNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: input.orderId },
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        })
      }

      if (order.buyerId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the buyer can initiate payment for this order',
        })
      }

      if (order.status !== 'PLACED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Order must be in PLACED status to initiate payment (current: ${order.status})`,
        })
      }

      try {
        const result = await createOrderPaymentRequest(
          ctx.prisma,
          input.orderId,
          ctx.userId,
          input.phoneNumber,
        )
        return result
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: err instanceof Error ? err.message : 'Failed to initiate payment',
        })
      }
    }),

  checkPaymentStatus: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: input.orderId },
        include: { payment: true },
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        })
      }

      if (order.buyerId !== ctx.userId && order.sellerId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this order',
        })
      }

      return {
        paymentStatus: order.payment?.status ?? null,
        paidAt: order.paidAt,
      }
    }),

  getMyOrders: protectedProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      where: {
        OR: [{ buyerId: ctx.userId }, { sellerId: ctx.userId }],
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: {
              select: {
                url: true,
              },
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return orders.map((order) => ({
      id: order.id,
      listingId: order.listingId,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      status: order.status,
      amountSEK: order.amountSEK,
      commissionSEK: order.commissionSEK,
      shippingOption: order.shippingOption,
      trackingNumber: order.trackingNumber,
      placedAt: order.placedAt,
      paidAt: order.paidAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      completedAt: order.completedAt,
      autoConfirmAt: order.autoConfirmAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      listing: {
        id: order.listing.id,
        title: order.listing.title,
        image: order.listing.images[0]?.url ?? null,
      },
    }))
  }),
})
