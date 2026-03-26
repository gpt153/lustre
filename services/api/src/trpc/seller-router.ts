import { z } from 'zod'
import { router, protectedProcedure } from './middleware.js'

export const sellerRouter = router({
  registerSwishNumber: protectedProcedure
    .input(z.object({ swishNumber: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.sellerSwishNumber.upsert({
        where: { userId: ctx.userId },
        create: {
          userId: ctx.userId,
          swishNumber: input.swishNumber,
        },
        update: {
          swishNumber: input.swishNumber,
        },
      })

      return { success: true }
    }),

  getSwishNumber: protectedProcedure.query(async ({ ctx }) => {
    const record = await ctx.prisma.sellerSwishNumber.findUnique({
      where: { userId: ctx.userId },
    })

    return { swishNumber: record?.swishNumber ?? null }
  }),
})
