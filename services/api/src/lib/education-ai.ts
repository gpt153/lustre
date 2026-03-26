import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface GeneratedArticle {
  title: string
  content: string
  readingTimeMinutes: number
}

export async function generateArticle(
  topicTitle: string,
  topicDescription: string,
  category: string,
  audience: string,
  language: string
): Promise<GeneratedArticle> {
  const audienceMap: Record<string, string> = {
    ALL: 'alla vuxna oavsett kön och identitet',
    WOMEN: 'kvinnor och personer med vulva',
    MEN: 'män och personer med penis',
    NON_BINARY: 'icke-binära personer',
    COUPLES: 'par och partners',
  }

  const audienceDesc = audienceMap[audience] ?? audienceMap.ALL
  const isSwedish = language === 'sv'

  const systemPrompt = isSwedish
    ? `Du är en expert på sexuell hälsa och välmående. Du skriver informativa, sexpositivia och inkluderande artiklar på svenska. Ditt språk är varmt, professionellt och icke-dömande. Du använder ett enkelt och tillgängligt språk utan onödig jargong.`
    : `You are an expert in sexual health and wellbeing. You write informative, sex-positive, and inclusive articles in English. Your tone is warm, professional, and non-judgmental. You use simple, accessible language.`

  const userPrompt = isSwedish
    ? `Skriv en informativ artikel om "${topicTitle}" riktad till ${audienceDesc}.

Ämnesbeskrivning: ${topicDescription}
Kategori: ${category}

Krav:
- 800-1200 ord
- Markdown-format med ## rubriker för sektioner
- Inkludera: introduktion, 3-4 sektioner med underrubriker, avslutning
- Sexpositivt, inkluderande och icke-dömande tonfall
- Praktisk och användbar information
- Inga medicinska råd eller diagnoser
- Returnera ENBART artikeln i markdown, utan förord eller kommentarer`
    : `Write an informative article about "${topicTitle}" for ${audienceDesc}.

Topic description: ${topicDescription}
Category: ${category}

Requirements:
- 800-1200 words
- Markdown format with ## headers for sections
- Include: introduction, 3-4 sections with subheadings, conclusion
- Sex-positive, inclusive, non-judgmental tone
- Practical and useful information
- No medical advice or diagnoses
- Return ONLY the article in markdown, no preamble or comments`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const rawContent = response.content[0].type === 'text' ? response.content[0].text : ''

  const disclaimer = isSwedish
    ? '\n\n> ⚕️ Denna information ersätter inte professionell medicinsk rådgivning. Vid frågor om din hälsa, kontakta en läkare.'
    : '\n\n> ⚕️ This information does not replace professional medical advice. For health questions, consult a doctor.'

  const content = rawContent + disclaimer
  const wordCount = content.split(/\s+/).length
  const readingTimeMinutes = Math.ceil(wordCount / 200)

  // Extract title from first # heading, or use topic title
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : topicTitle

  return { title, content, readingTimeMinutes }
}
