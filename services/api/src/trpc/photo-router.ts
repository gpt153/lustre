import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { deleteFromR2, getPhotoKey } from '../lib/r2.js'

export const photoRouter = router({
  delete: protectedProcedure
    .input(z.object({ photoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
        include: { photos: true },
      })
      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
      }

      const photo = profile.photos.find(p => p.id === input.photoId)
      if (!photo) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Photo not found' })
      }

      // Prevent deleting last photo
      if (profile.photos.length <= 1) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot delete last photo' })
      }

      // Delete from R2
      const sizes = ['original', 'small', 'medium', 'large']
      await Promise.all(sizes.map(size =>
        deleteFromR2(getPhotoKey(profile.id, photo.id, size)).catch(() => {})
      ))

      // Delete from DB and reorder
      await ctx.prisma.$transaction(async (tx) => {
        await tx.profilePhoto.delete({ where: { id: photo.id } })
        // Reorder remaining photos
        const remaining = await tx.profilePhoto.findMany({
          where: { profileId: profile.id },
          orderBy: { position: 'asc' },
        })
        for (let i = 0; i < remaining.length; i++) {
          await tx.profilePhoto.update({
            where: { id: remaining[i].id },
            data: { position: i },
          })
        }
      })

      return { success: true }
    }),

  reorder: protectedProcedure
    .input(z.object({ photoIds: z.array(z.string().uuid()) }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
      })
      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
      }

      await ctx.prisma.$transaction(
        input.photoIds.map((id, index) =>
          ctx.prisma.profilePhoto.update({
            where: { id },
            data: { position: index },
          })
        )
      )

      return { success: true }
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.profile.findUnique({
      where: { userId: ctx.userId },
    })
    if (!profile) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }

    return ctx.prisma.profilePhoto.findMany({
      where: { profileId: profile.id },
      orderBy: { position: 'asc' },
    })
  }),
})
