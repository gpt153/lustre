import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from './middleware.js'
import { medusaClient } from '../lib/medusa-client.js'

export const shopRouter = router({
  product: router({
    list: publicProcedure
      .input(
        z.object({
          orgId: z.string().uuid().optional(),
          q: z.string().optional(),
          limit: z.number().default(20),
          offset: z.number().default(0),
        }),
      )
      .query(async ({ input }) => {
        const result = await medusaClient.getProducts({
          q: input.q,
          limit: input.limit,
          offset: input.offset,
        })
        return { products: result.products, count: result.count }
      }),

    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const result = await medusaClient.getProduct(input.id)
        if (!result.product) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' })
        }
        return result.product
      }),
  }),

  cart: router({
    add: protectedProcedure
      .input(
        z.object({
          variantId: z.string(),
          quantity: z.number().min(1).default(1),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await ctx.prisma.shopCart.findUnique({
          where: { userId: ctx.userId },
        })

        let cartId: string

        if (existing) {
          cartId = existing.cartId
        } else {
          const { cart } = await medusaClient.createCart()
          cartId = cart.id
          await ctx.prisma.shopCart.create({
            data: { userId: ctx.userId, cartId },
          })
        }

        const { cart } = await medusaClient.addLineItem(
          cartId,
          input.variantId,
          input.quantity,
        )
        return cart
      }),

    checkout: protectedProcedure
      .input(z.object({ swishPhone: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const shopCart = await ctx.prisma.shopCart.findUnique({
          where: { userId: ctx.userId },
        })

        if (!shopCart) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'No active cart' })
        }

        const { cart } = await medusaClient.getCart(shopCart.cartId)

        if (!cart.items || cart.items.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cart is empty' })
        }

        const completed = await medusaClient.completeCart(shopCart.cartId)

        if (completed.type !== 'order') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Cart checkout failed',
          })
        }

        const medusaOrderId = completed.data.id

        await ctx.prisma.shopCart.delete({ where: { userId: ctx.userId } })

        return {
          medusaOrderId,
          totalSEK: Math.round(cart.total / 100),
          swishPhone: input.swishPhone,
        }
      }),
  }),
})
