import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'

export const moduleRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const modules = await ctx.prisma.learnModule.findMany({
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: { id: true, order: true, title: true },
        },
        userProgress: {
          where: { userId: ctx.userId },
          select: { completedAt: true, badgeAwardedAt: true },
        },
      },
    })

    return modules.map((m) => ({
      id: m.id,
      order: m.order,
      title: m.title,
      description: m.description,
      badgeName: m.badgeName,
      isUnlocked: m.isUnlocked,
      createdAt: m.createdAt,
      lessons: m.lessons,
      progress: m.userProgress[0] ?? null,
    }))
  }),

  get: protectedProcedure
    .input(z.object({ moduleId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const module = await ctx.prisma.learnModule.findUnique({
        where: { id: input.moduleId },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
          userProgress: {
            where: { userId: ctx.userId },
          },
        },
      })

      if (!module) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Module not found' })
      }

      const lessonIds = module.lessons.map((l) => l.id)
      const lessonProgress = await ctx.prisma.userLessonProgress.findMany({
        where: { userId: ctx.userId, lessonId: { in: lessonIds } },
      })

      const lessonProgressMap = new Map(lessonProgress.map((lp) => [lp.lessonId, lp]))

      return {
        id: module.id,
        order: module.order,
        title: module.title,
        description: module.description,
        badgeName: module.badgeName,
        isUnlocked: module.isUnlocked,
        createdAt: module.createdAt,
        lessons: module.lessons.map((l) => ({
          ...l,
          progress: lessonProgressMap.get(l.id) ?? null,
        })),
        progress: module.userProgress[0] ?? null,
      }
    }),

  startLesson: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const lesson = await ctx.prisma.lesson.findUnique({
        where: { id: input.lessonId },
        include: { module: true },
      })

      if (!lesson) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lesson not found' })
      }

      if (!lesson.module.isUnlocked) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Module is locked' })
      }

      const progress = await ctx.prisma.userLessonProgress.upsert({
        where: { userId_lessonId: { userId: ctx.userId, lessonId: input.lessonId } },
        update: {},
        create: {
          userId: ctx.userId,
          lessonId: input.lessonId,
          startedAt: new Date(),
        },
      })

      return {
        progress,
        lesson: {
          id: lesson.id,
          title: lesson.title,
          coachSystemPrompt: lesson.coachSystemPrompt,
          partnerSystemPrompt: lesson.partnerSystemPrompt,
          assessmentCriteria: lesson.assessmentCriteria,
          moduleId: lesson.moduleId,
        },
      }
    }),

  completeLesson: protectedProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
        passed: z.boolean(),
        feedback: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const lesson = await ctx.prisma.lesson.findUnique({
        where: { id: input.lessonId },
        include: {
          module: {
            include: {
              lessons: { select: { id: true } },
            },
          },
        },
      })

      if (!lesson) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lesson not found' })
      }

      const lessonProgress = await ctx.prisma.userLessonProgress.upsert({
        where: { userId_lessonId: { userId: ctx.userId, lessonId: input.lessonId } },
        update: {
          completedAt: new Date(),
          passed: input.passed,
          feedback: input.feedback ?? null,
        },
        create: {
          userId: ctx.userId,
          lessonId: input.lessonId,
          startedAt: new Date(),
          completedAt: new Date(),
          passed: input.passed,
          feedback: input.feedback ?? null,
        },
      })

      // Check if all lessons in the module are completed with passed=true
      const allLessonIds = lesson.module.lessons.map((l) => l.id)
      const completedLessons = await ctx.prisma.userLessonProgress.findMany({
        where: {
          userId: ctx.userId,
          lessonId: { in: allLessonIds },
          passed: true,
          completedAt: { not: null },
        },
      })

      const moduleCompleted = completedLessons.length === allLessonIds.length

      let moduleProgress = null
      if (moduleCompleted) {
        moduleProgress = await ctx.prisma.userModuleProgress.upsert({
          where: { userId_moduleId: { userId: ctx.userId, moduleId: lesson.moduleId } },
          update: {
            completedAt: new Date(),
            badgeAwardedAt: new Date(),
          },
          create: {
            userId: ctx.userId,
            moduleId: lesson.moduleId,
            completedAt: new Date(),
            badgeAwardedAt: new Date(),
          },
        })

        // Unlock the next module
        await ctx.prisma.learnModule.updateMany({
          where: { order: lesson.module.order + 1 },
          data: { isUnlocked: true },
        })
      }

      return { lessonProgress, moduleProgress, moduleCompleted }
    }),

  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const moduleProgress = await ctx.prisma.userModuleProgress.findMany({
      where: { userId: ctx.userId },
      include: { module: { select: { id: true, order: true, title: true, badgeName: true } } },
    })

    const lessonProgress = await ctx.prisma.userLessonProgress.findMany({
      where: { userId: ctx.userId },
      include: { lesson: { select: { id: true, title: true, moduleId: true } } },
    })

    return { moduleProgress, lessonProgress }
  }),
})
