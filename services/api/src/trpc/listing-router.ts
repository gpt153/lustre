import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure, publicProcedure } from './middleware.js'

const listingCategorySchema = z.enum([
  'UNDERWEAR',
  'TOYS',
  'FETISH_ITEMS',
  'HANDMADE_GOODS',
  'ACCESSORIES',
  'CLOTHING',
  'OTHER',
])

const shippingOptionSchema = z.enum(['STANDARD_POST', 'EXPRESS_POST', 'PICKUP'])

const listingStatusSchema = z.enum(['ACTIVE', 'SOLD', 'REMOVED'])

export const listingRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().max(100),
        description: z.string().max(2000),
        price: z.number().int().min(100),
        category: listingCategorySchema,
        shippingOptions: shippingOptionSchema.array().min(1),
        imageUrls: z.string().array().max(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.listing.create({
        data: {
          title: input.title,
          description: input.description,
          price: input.price,
          category: input.category,
          shippingOptions: input.shippingOptions,
          status: 'ACTIVE',
          sellerId: ctx.userId,
          images: {
            create: input.imageUrls.map((url, order) => ({
              url,
              order,
            })),
          },
        },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
        },
      })

      return listing
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().max(100).optional(),
        description: z.string().max(2000).optional(),
        price: z.number().int().min(100).optional(),
        category: listingCategorySchema.optional(),
        shippingOptions: shippingOptionSchema.array().min(1).optional(),
        imageUrls: z.string().array().max(8).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.listing.findUnique({
        where: { id: input.id },
      })

      if (!listing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Listing not found',
        })
      }

      if (listing.sellerId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the listing owner can update it',
        })
      }

      // Delete old images if new ones provided
      if (input.imageUrls) {
        await ctx.prisma.listingImage.deleteMany({
          where: { listingId: input.id },
        })
      }

      const updated = await ctx.prisma.listing.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          price: input.price,
          category: input.category,
          shippingOptions: input.shippingOptions,
          images: input.imageUrls
            ? {
                create: input.imageUrls.map((url, order) => ({
                  url,
                  order,
                })),
              }
            : undefined,
        },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
        },
      })

      return updated
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.listing.findUnique({
        where: { id: input.id },
      })

      if (!listing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Listing not found',
        })
      }

      if (listing.sellerId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the listing owner can remove it',
        })
      }

      await ctx.prisma.listing.update({
        where: { id: input.id },
        data: { status: 'REMOVED' },
      })

      return { success: true }
    }),

  list: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
        category: listingCategorySchema.optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit + 1

      const listings = await ctx.prisma.listing.findMany({
        where: {
          status: 'ACTIVE',
          ...(input.category && { category: input.category }),
          ...(input.search && {
            title: {
              mode: 'insensitive',
              contains: input.search,
            },
          }),
        },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          seller: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        skip: input.cursor ? 1 : 0,
        take: limit,
      })

      let nextCursor: string | undefined
      if (listings.length > input.limit) {
        const nextItem = listings.pop()
        nextCursor = nextItem?.id
      }

      return {
        items: listings.map((listing) => ({
          ...listing,
          seller: {
            id: listing.seller.id,
            displayName: listing.seller.displayName,
          },
        })),
        nextCursor,
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.prisma.listing.findUnique({
        where: { id: input.id },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          seller: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      })

      if (!listing || listing.status === 'REMOVED') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Listing not found',
        })
      }

      return {
        ...listing,
        seller: {
          id: listing.seller.id,
          displayName: listing.seller.displayName,
        },
      }
    }),

  getByCategory: publicProcedure
    .input(
      z.object({
        category: listingCategorySchema,
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit + 1

      const listings = await ctx.prisma.listing.findMany({
        where: {
          status: 'ACTIVE',
          category: input.category,
        },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          seller: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        skip: input.cursor ? 1 : 0,
        take: limit,
      })

      let nextCursor: string | undefined
      if (listings.length > input.limit) {
        const nextItem = listings.pop()
        nextCursor = nextItem?.id
      }

      return {
        items: listings.map((listing) => ({
          ...listing,
          seller: {
            id: listing.seller.id,
            displayName: listing.seller.displayName,
          },
        })),
        nextCursor,
      }
    }),

  getMine: protectedProcedure.query(async ({ ctx }) => {
    const listings = await ctx.prisma.listing.findMany({
      where: {
        sellerId: ctx.userId,
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        seller: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return listings.map((listing) => ({
      ...listing,
      seller: {
        id: listing.seller.id,
        displayName: listing.seller.displayName,
      },
    }))
  }),
})
