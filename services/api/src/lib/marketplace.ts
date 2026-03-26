import type { PrismaClient } from '@prisma/client'

export async function autoConfirmOrders(prisma: PrismaClient): Promise<void> {
  const now = new Date()

  await prisma.order.updateMany({
    where: {
      status: 'SHIPPED',
      autoConfirmAt: {
        lte: now,
      },
    },
    data: {
      status: 'DELIVERED',
      deliveredAt: now,
    },
  })
}
