import type { PrismaClient } from '@prisma/client'
import { TRPCError } from '@trpc/server'

export const GATEKEEPER_COST = 20

export async function checkBalance(prisma: PrismaClient, userId: string): Promise<number> {
  const balance = await prisma.userBalance.findUnique({
    where: { userId },
  })
  return balance?.balance ?? 0
}

export async function debitTokens(
  prisma: PrismaClient,
  userId: string,
  amount: number,
  type: 'GATEKEEPER' | 'TOPUP' | 'REFUND',
  referenceId?: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const balance = await tx.userBalance.upsert({
      where: { userId },
      create: { userId, balance: 0 },
      update: {},
    })

    if (balance.balance < amount) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Insufficient tokens',
      })
    }

    await tx.userBalance.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    })

    await tx.tokenTransaction.create({
      data: {
        userId,
        amount: -amount,
        type,
        referenceId: referenceId ?? null,
      },
    })
  })
}

export async function creditTokens(
  prisma: PrismaClient,
  userId: string,
  amount: number,
  type: 'GATEKEEPER' | 'TOPUP' | 'REFUND',
  referenceId?: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.userBalance.upsert({
      where: { userId },
      create: { userId, balance: amount },
      update: { balance: { increment: amount } },
    })

    await tx.tokenTransaction.create({
      data: {
        userId,
        amount,
        type,
        referenceId: referenceId ?? null,
      },
    })
  })
}
