import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'

export const pairRouter = router({
  invite: protectedProcedure
    .input(z.object({ toUserId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const myProfile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
      })
      if (!myProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Your profile not found' })
      }

      const targetProfile = await ctx.prisma.profile.findUnique({
        where: { userId: input.toUserId },
      })
      if (!targetProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Target profile not found' })
      }

      if (myProfile.id === targetProfile.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot invite yourself' })
      }

      // Check for existing pending invitation
      const existing = await ctx.prisma.pairInvitation.findFirst({
        where: {
          fromProfileId: myProfile.id,
          toProfileId: targetProfile.id,
          status: 'PENDING',
        },
      })
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Invitation already pending' })
      }

      // Check if already linked
      const alreadyLinked = await ctx.prisma.pairLinkMember.findFirst({
        where: {
          profileId: myProfile.id,
          pairLink: {
            members: {
              some: { profileId: targetProfile.id },
            },
          },
        },
      })
      if (alreadyLinked) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Already linked with this user' })
      }

      const invitation = await ctx.prisma.pairInvitation.create({
        data: {
          fromProfileId: myProfile.id,
          toProfileId: targetProfile.id,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        },
      })

      return invitation
    }),

  respond: protectedProcedure
    .input(z.object({
      invitationId: z.string().uuid(),
      accept: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const myProfile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
      })
      if (!myProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
      }

      const invitation = await ctx.prisma.pairInvitation.findUnique({
        where: { id: input.invitationId },
      })
      if (!invitation || invitation.toProfileId !== myProfile.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invitation not found' })
      }
      if (invitation.status !== 'PENDING') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invitation already responded to' })
      }
      if (invitation.expiresAt < new Date()) {
        await ctx.prisma.pairInvitation.update({
          where: { id: invitation.id },
          data: { status: 'EXPIRED' },
        })
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invitation has expired' })
      }

      if (!input.accept) {
        await ctx.prisma.pairInvitation.update({
          where: { id: invitation.id },
          data: { status: 'DECLINED' },
        })
        return { success: true, linked: false }
      }

      // Accept: create or join pair link
      await ctx.prisma.$transaction(async (tx) => {
        await tx.pairInvitation.update({
          where: { id: invitation.id },
          data: { status: 'ACCEPTED' },
        })

        // Check if the inviter is already in a pair link
        const existingMembership = await tx.pairLinkMember.findFirst({
          where: { profileId: invitation.fromProfileId },
          include: { pairLink: { include: { members: true } } },
        })

        if (existingMembership) {
          // Check max 5 members
          if (existingMembership.pairLink.members.length >= 5) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pair link has maximum 5 members' })
          }
          // Add to existing link
          await tx.pairLinkMember.create({
            data: {
              pairLinkId: existingMembership.pairLinkId,
              profileId: myProfile.id,
            },
          })
        } else {
          // Create new pair link with both members
          const pairLink = await tx.pairLink.create({ data: {} })
          await tx.pairLinkMember.createMany({
            data: [
              { pairLinkId: pairLink.id, profileId: invitation.fromProfileId },
              { pairLinkId: pairLink.id, profileId: myProfile.id },
            ],
          })
        }
      })

      return { success: true, linked: true }
    }),

  getMyLinks: protectedProcedure.query(async ({ ctx }) => {
    const myProfile = await ctx.prisma.profile.findUnique({
      where: { userId: ctx.userId },
    })
    if (!myProfile) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }

    const memberships = await ctx.prisma.pairLinkMember.findMany({
      where: { profileId: myProfile.id },
      include: {
        pairLink: {
          include: {
            members: {
              include: {
                profile: {
                  select: {
                    id: true,
                    userId: true,
                    displayName: true,
                    photos: {
                      where: { isPublic: true },
                      orderBy: { position: 'asc' },
                      take: 1,
                      select: { thumbnailSmall: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    return memberships.map(m => ({
      pairLinkId: m.pairLinkId,
      members: m.pairLink.members.map(member => ({
        profileId: member.profileId,
        userId: member.profile.userId,
        displayName: member.profile.displayName,
        thumbnailUrl: member.profile.photos[0]?.thumbnailSmall ?? null,
        joinedAt: member.joinedAt,
      })),
    }))
  }),

  getPendingInvitations: protectedProcedure.query(async ({ ctx }) => {
    const myProfile = await ctx.prisma.profile.findUnique({
      where: { userId: ctx.userId },
    })
    if (!myProfile) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }

    return ctx.prisma.pairInvitation.findMany({
      where: {
        toProfileId: myProfile.id,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: {
        fromProfile: {
          select: {
            displayName: true,
            userId: true,
            photos: {
              where: { isPublic: true },
              orderBy: { position: 'asc' },
              take: 1,
              select: { thumbnailSmall: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  leave: protectedProcedure
    .input(z.object({ pairLinkId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const myProfile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
      })
      if (!myProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
      }

      const membership = await ctx.prisma.pairLinkMember.findFirst({
        where: {
          profileId: myProfile.id,
          pairLinkId: input.pairLinkId,
        },
        include: { pairLink: { include: { members: true } } },
      })
      if (!membership) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Not a member of this pair link' })
      }

      await ctx.prisma.$transaction(async (tx) => {
        await tx.pairLinkMember.delete({ where: { id: membership.id } })

        // If only 1 or 0 members left, delete the pair link
        if (membership.pairLink.members.length <= 2) {
          await tx.pairLink.delete({ where: { id: input.pairLinkId } })
        }
      })

      return { success: true }
    }),
})
