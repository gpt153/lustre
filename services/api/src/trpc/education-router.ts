import { router, protectedProcedure } from './middleware.js'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

const EducationCategorySchema = z.enum(['ANATOMY', 'PLEASURE', 'STI_PREVENTION', 'MENTAL_HEALTH', 'RELATIONSHIPS', 'KINK_SAFETY', 'LGBTQ', 'AGING'])
const EducationAudienceSchema = z.enum(['ALL', 'WOMEN', 'MEN', 'NON_BINARY', 'COUPLES'])

export const educationRouter = router({
  listTopics: protectedProcedure
    .input(z.object({ category: EducationCategorySchema.optional(), language: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.educationTopic.findMany({
        where: {
          ...(input?.category ? { category: input.category } : {}),
          ...(input?.language ? { language: input.language } : {}),
        },
        orderBy: { order: 'asc' },
      })
    }),

  listArticles: protectedProcedure
    .input(z.object({
      topicSlug: z.string().optional(),
      audience: EducationAudienceSchema.optional(),
      language: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const topic = input?.topicSlug
        ? await ctx.prisma.educationTopic.findUnique({ where: { slug: input.topicSlug } })
        : null

      const articles = await ctx.prisma.educationArticle.findMany({
        where: {
          ...(topic ? { topicId: topic.id } : {}),
          ...(input?.audience ? { audience: input.audience } : {}),
          ...(input?.language ? { language: input.language } : {}),
        },
        include: { topic: { select: { slug: true, title: true, category: true } } },
        orderBy: { createdAt: 'desc' },
      })
      // Return list view (truncated content)
      return articles.map(a => ({
        ...a,
        content: a.content.slice(0, 500) + (a.content.length > 500 ? '...' : ''),
      }))
    }),

  getArticle: protectedProcedure
    .input(z.object({ articleId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const article = await ctx.prisma.educationArticle.findUnique({
        where: { id: input.articleId },
        include: { topic: true },
      })
      if (!article) throw new TRPCError({ code: 'NOT_FOUND', message: 'Article not found' })

      const userRead = await ctx.prisma.userArticleRead.findUnique({
        where: { userId_articleId: { userId: ctx.userId, articleId: input.articleId } },
      })

      return { ...article, isRead: !!userRead }
    }),

  listPodcasts: protectedProcedure
    .input(z.object({ topicSlug: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const topic = input?.topicSlug
        ? await ctx.prisma.educationTopic.findUnique({ where: { slug: input.topicSlug } })
        : null

      return ctx.prisma.educationPodcast.findMany({
        where: topic ? { topicId: topic.id } : {},
        include: { topic: { select: { slug: true, title: true } } },
        orderBy: { createdAt: 'desc' },
      })
    }),

  listQuizzes: protectedProcedure
    .input(z.object({ topicSlug: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const topic = input?.topicSlug
        ? await ctx.prisma.educationTopic.findUnique({ where: { slug: input.topicSlug } })
        : null

      const quizzes = await ctx.prisma.educationQuiz.findMany({
        where: topic ? { topicId: topic.id } : {},
        include: { topic: { select: { slug: true, title: true } } },
      })
      // Strip correct answers from list view
      return quizzes.map(q => ({
        ...q,
        questions: (q.questions as any[]).map(({ question, options }) => ({ question, options })),
      }))
    }),

  getQuiz: protectedProcedure
    .input(z.object({ quizId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const quiz = await ctx.prisma.educationQuiz.findUnique({
        where: { id: input.quizId },
        include: { topic: true },
      })
      if (!quiz) throw new TRPCError({ code: 'NOT_FOUND', message: 'Quiz not found' })
      return quiz
    }),

  submitQuiz: protectedProcedure
    .input(z.object({
      quizId: z.string().uuid(),
      answers: z.array(z.number()),
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await ctx.prisma.educationQuiz.findUnique({ where: { id: input.quizId } })
      if (!quiz) throw new TRPCError({ code: 'NOT_FOUND', message: 'Quiz not found' })

      const questions = quiz.questions as Array<{ question: string; options: string[]; correctIndex: number; explanation: string }>
      const correctCount = input.answers.filter((answer, i) => answer === questions[i]?.correctIndex).length
      const score = Math.round((correctCount / questions.length) * 100)

      await ctx.prisma.userQuizAttempt.create({
        data: {
          userId: ctx.userId,
          quizId: input.quizId,
          score,
          answers: input.answers,
        },
      })

      return { score, correctCount, totalQuestions: questions.length }
    }),

  markArticleRead: protectedProcedure
    .input(z.object({ articleId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.userArticleRead.upsert({
        where: { userId_articleId: { userId: ctx.userId, articleId: input.articleId } },
        update: {},
        create: { userId: ctx.userId, articleId: input.articleId },
      })
      return { success: true }
    }),
})
