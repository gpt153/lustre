import Anthropic from '@anthropic-ai/sdk'
import type { PrismaClient } from '@prisma/client'
import { uploadToR2 } from './r2.js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface PodcastScript {
  title: string
  description: string
  segments: Array<{ speaker: 'HOST1' | 'HOST2'; text: string }>
}

export async function generatePodcastScript(
  topicTitle: string,
  topicDescription: string,
  language: string
): Promise<PodcastScript> {
  const isSwedish = language === 'sv'

  const systemPrompt = isSwedish
    ? 'Du är producent för en sexuell hälso-podcast. Du skriver engagerande, informativa och sexpositivia manus på svenska. HOST1 är Axel, en manlig sexolog och expert. HOST2 är Sofia, en nyfiken värd som ställer frågor från lyssnarnas perspektiv.'
    : 'You are a sexual health podcast producer. You write engaging, informative, sex-positive scripts. HOST1 is Alex, a male sexologist and expert. HOST2 is Sofia, a curious host asking questions from the listener perspective.'

  const userPrompt = isSwedish
    ? `Skriv ett podcastmanus om "${topicTitle}" (${topicDescription}).

Format:
- 20-30 segment, alternera mellan HOST1 och HOST2
- Varje segment: 2-4 meningar
- Börja med en titel och kort beskrivning, sedan manuset
- Använd exakt detta format:

TITEL: <podcasttitel>
BESKRIVNING: <1-2 meningar som beskriver avsnittet>

HOST1: <text>
HOST2: <text>
HOST1: <text>
...

Innehåll: introduktion, 3-4 utbildningssektioner, avslutning med sammanfattning.
Ton: varm, professionell, icke-dömande, sexpositivt.`
    : `Write a podcast script about "${topicTitle}" (${topicDescription}).

Format:
- 20-30 segments alternating HOST1 and HOST2
- Each segment: 2-4 sentences
- Start with title and description, then the script
- Use exactly this format:

TITLE: <podcast title>
DESCRIPTION: <1-2 sentences describing the episode>

HOST1: <text>
HOST2: <text>
HOST1: <text>
...

Content: introduction, 3-4 educational sections, closing summary.
Tone: warm, professional, non-judgmental, sex-positive.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Parse title and description
  const titleMatch = text.match(/^(?:TITEL|TITLE):\s*(.+)$/im)
  const descMatch = text.match(/^(?:BESKRIVNING|DESCRIPTION):\s*(.+)$/im)
  const title = titleMatch?.[1]?.trim() ?? topicTitle
  const description = descMatch?.[1]?.trim() ?? topicDescription

  // Parse segments — match HOST1: or HOST2: lines (possibly multiline)
  const segments: PodcastScript['segments'] = []
  const segmentRegex = /^(HOST[12]):\s*([\s\S]+?)(?=^HOST[12]:|$)/gim
  let match
  while ((match = segmentRegex.exec(text)) !== null) {
    const speaker = match[1] as 'HOST1' | 'HOST2'
    const segText = match[2].trim().replace(/\n/g, ' ')
    if (segText) {
      segments.push({ speaker, text: segText })
    }
  }

  return { title, description, segments }
}

export async function synthesizePodcast(
  script: PodcastScript,
  host1VoiceId: string,
  host2VoiceId: string
): Promise<Buffer> {
  const audioBuffers: Buffer[] = []

  // Process sequentially to avoid ElevenLabs rate limits
  for (const segment of script.segments) {
    const voiceId = segment.speaker === 'HOST1' ? host1VoiceId : host2VoiceId

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: segment.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${await response.text()}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    audioBuffers.push(Buffer.from(arrayBuffer))
  }

  return Buffer.concat(audioBuffers)
}

export async function uploadPodcastToR2(
  audioBuffer: Buffer,
  podcastId: string,
  topicSlug: string
): Promise<string> {
  const key = `education/podcasts/${topicSlug}/${podcastId}.mp3`
  return uploadToR2(key, audioBuffer, 'audio/mpeg')
}

export async function generateAndStorePodcast(
  prisma: PrismaClient,
  topicId: string,
  topicTitle: string,
  topicDescription: string,
  topicSlug: string,
  language: string
): Promise<string> {
  const host1VoiceId = 'ErXwobaYiN019PkySvjV'
  const host2VoiceId = '21m00Tcm4TlvDq8ikWAM'

  console.log(`  Generating script for: ${topicTitle}`)
  const script = await generatePodcastScript(topicTitle, topicDescription, language)

  console.log(`  Synthesizing ${script.segments.length} segments...`)
  const audioBuffer = await synthesizePodcast(script, host1VoiceId, host2VoiceId)

  const tempId = `${topicSlug}-${Date.now()}`
  console.log(`  Uploading audio to R2...`)
  const audioUrl = await uploadPodcastToR2(audioBuffer, tempId, topicSlug)

  await prisma.educationPodcast.upsert({
    where: { topicId_language: { topicId, language } },
    update: {
      title: script.title,
      description: script.description,
      audioUrl,
      generatedAt: new Date(),
    },
    create: {
      topicId,
      title: script.title,
      description: script.description,
      audioUrl,
      audience: 'ALL',
      language,
      host1VoiceId,
      host2VoiceId,
      generatedAt: new Date(),
    },
  })

  return audioUrl
}
