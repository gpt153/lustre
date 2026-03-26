# Epic: wave-1c-podcast-generator

**Wave:** 1 — Group A (parallel)
**Model:** sonnet
**Status:** NOT_STARTED

## Goal

Build an AI podcast generation pipeline. Use Claude to write a dual-host conversation script, ElevenLabs TTS to synthesize two voices, concatenate audio, and store the episode in R2. Create a script to generate one test podcast episode.

## Codebase Context

- **ElevenLabs:** Already used in F15 coach engine (`services/coach/`) with env var `ELEVENLABS_API_KEY`. Voice IDs: host1 `ErXwobaYiN019PkySvjV` (Axel), host2 `21m00Tcm4TlvDq8ikWAM` (Sophia)
- **R2 upload pattern:** See `services/api/src/lib/r2.ts` or photo upload pattern. Uses `@aws-sdk/client-s3` with R2 endpoint. Env vars: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- **Anthropic SDK:** Use `@anthropic-ai/sdk` (added in wave-1b). Model: `claude-sonnet-4-6`
- **Wave 1a dependency:** Schema includes EducationPodcast model — write podcast records using that model. Developed in parallel but schema will be merged before running.

## File Paths

1. `services/api/src/lib/podcast-generator.ts` — generation pipeline (script + TTS + R2 upload)
2. `services/api/scripts/generate-podcasts.ts` — CLI script to generate one test podcast episode

## Implementation Details

### podcast-generator.ts

```typescript
export interface PodcastScript {
  title: string
  description: string
  segments: Array<{ speaker: 'HOST1' | 'HOST2', text: string }>
}

export async function generatePodcastScript(
  topicTitle: string,
  topicDescription: string,
  language: string
): Promise<PodcastScript>
// Uses Claude to generate a 10-15 minute dual-host conversation
// Script format: alternating HOST1 (expert) and HOST2 (curious host) segments
// Each segment is 2-4 sentences
// Total 20-30 segments
// Language: Swedish if language='sv'

export async function synthesizePodcast(
  script: PodcastScript,
  host1VoiceId: string,
  host2VoiceId: string
): Promise<Buffer>
// 1. For each segment, call ElevenLabs TTS API with appropriate voice
// 2. Collect all audio buffers (mp3)
// 3. Concatenate audio buffers (simple Buffer.concat — browsers handle MP3 concatenation)
// 4. Return combined buffer

export async function uploadPodcastToR2(
  audioBuffer: Buffer,
  podcastId: string,
  topicSlug: string
): Promise<string>
// Upload to R2: education/podcasts/<topicSlug>/<podcastId>.mp3
// Return public URL

export async function generateAndStorePodcast(
  prisma: PrismaClient,
  topicId: string,
  topicTitle: string,
  topicDescription: string,
  topicSlug: string,
  language: string
): Promise<string>
// Orchestrates: generatePodcastScript → synthesizePodcast → uploadPodcastToR2
// Creates/updates EducationPodcast record in DB
// Returns audio URL
```

### ElevenLabs TTS API call

```
POST https://api.elevenlabs.io/v1/text-to-speech/<voice_id>
Headers: xi-api-key: <ELEVENLABS_API_KEY>
Body: { text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }
Response: binary mp3 audio
```

### generate-podcasts.ts

Script flow:
1. Connect to DB
2. Fetch the FIRST topic from education_topics (ordered by order ASC)
3. Call generateAndStorePodcast for that one topic
4. Log: "Generated podcast: <title> → <audioUrl>"
5. Disconnect

## Acceptance Criteria

1. `generatePodcastScript` calls Claude claude-sonnet-4-6 to produce a dual-host conversation script with 20-30 alternating HOST1/HOST2 segments in Swedish
2. Script includes intro, 3-4 topic sections, and conclusion
3. `synthesizePodcast` calls ElevenLabs TTS API (eleven_multilingual_v2) for each segment with correct voice ID
4. Audio segments are concatenated into a single MP3 buffer
5. `uploadPodcastToR2` uploads to R2 at path `education/podcasts/<topicSlug>/<podcastId>.mp3` and returns public URL
6. `generateAndStorePodcast` creates/updates an EducationPodcast record with audioUrl and generatedAt timestamp
7. `generate-podcasts.ts` script runs end-to-end for the first topic without errors
8. Script logs the generated podcast title and audio URL on success
