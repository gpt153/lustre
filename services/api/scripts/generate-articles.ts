import { PrismaClient } from '@prisma/client'
import { generateArticle } from '../src/lib/education-ai.js'

const prisma = new PrismaClient()

async function main() {
  console.log('Fetching topics...')
  const topics = await prisma.educationTopic.findMany({ orderBy: { order: 'asc' } })
  console.log(`Found ${topics.length} topics`)

  // Process in batches of 3 to avoid rate limits
  for (let i = 0; i < topics.length; i += 3) {
    const batch = topics.slice(i, i + 3)
    const results = await Promise.allSettled(
      batch.map(async (topic) => {
        const article = await generateArticle(
          topic.title,
          topic.description,
          topic.category,
          'ALL',
          'sv'
        )

        await prisma.educationArticle.upsert({
          where: {
            topicId_audience_language: {
              topicId: topic.id,
              audience: 'ALL',
              language: 'sv',
            },
          },
          update: {
            title: article.title,
            content: article.content,
            readingTimeMinutes: article.readingTimeMinutes,
            generatedAt: new Date(),
          },
          create: {
            topicId: topic.id,
            title: article.title,
            content: article.content,
            audience: 'ALL',
            language: 'sv',
            readingTimeMinutes: article.readingTimeMinutes,
            generatedAt: new Date(),
          },
        })

        console.log(`Generated: ${topic.title} [ALL/sv]`)
      })
    )

    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Failed to generate article:', result.reason)
      }
    }
  }

  console.log('Done!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
