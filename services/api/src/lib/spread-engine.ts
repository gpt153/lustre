import type { PrismaClient } from '@prisma/client'

const FALLBACK_MULTIPLIER = 3.0

export async function calculateTokenCost(
  prisma: PrismaClient,
  baseCost: number,
  segment?: string,
  market?: string
): Promise<number> {
  let multiplier = FALLBACK_MULTIPLIER

  if (segment && market) {
    const config = await prisma.spreadConfig.findUnique({
      where: { segment_market: { segment, market } },
    })
    if (config) {
      multiplier = config.multiplier.toNumber()
    } else {
      const segmentConfig = await prisma.spreadConfig.findFirst({
        where: { segment, market: null },
      })
      if (segmentConfig) {
        multiplier = segmentConfig.multiplier.toNumber()
      } else {
        const marketConfig = await prisma.spreadConfig.findFirst({
          where: { segment: null, market },
        })
        if (marketConfig) {
          multiplier = marketConfig.multiplier.toNumber()
        } else {
          const defaultConfig = await prisma.spreadConfig.findFirst({
            where: { isDefault: true },
          })
          if (defaultConfig) {
            multiplier = defaultConfig.multiplier.toNumber()
          }
        }
      }
    }
  } else if (segment) {
    const segmentConfig = await prisma.spreadConfig.findFirst({
      where: { segment, market: null },
    })
    if (segmentConfig) {
      multiplier = segmentConfig.multiplier.toNumber()
    } else {
      const defaultConfig = await prisma.spreadConfig.findFirst({
        where: { isDefault: true },
      })
      if (defaultConfig) {
        multiplier = defaultConfig.multiplier.toNumber()
      }
    }
  } else if (market) {
    const marketConfig = await prisma.spreadConfig.findFirst({
      where: { segment: null, market },
    })
    if (marketConfig) {
      multiplier = marketConfig.multiplier.toNumber()
    } else {
      const defaultConfig = await prisma.spreadConfig.findFirst({
        where: { isDefault: true },
      })
      if (defaultConfig) {
        multiplier = defaultConfig.multiplier.toNumber()
      }
    }
  } else {
    const defaultConfig = await prisma.spreadConfig.findFirst({
      where: { isDefault: true },
    })
    if (defaultConfig) {
      multiplier = defaultConfig.multiplier.toNumber()
    }
  }

  const result = baseCost * multiplier
  return Math.round(result * 100000) / 100000
}
