import { prisma } from '../trpc/context.js'

const VIDEOSEAL_API_URL = process.env.VIDEOSEAL_API_URL || ''
const VIDEOSEAL_API_KEY = process.env.VIDEOSEAL_API_KEY || ''

export interface WatermarkPayload {
  userId: string
  recordingId: string
  sessionId: string
  timestamp: string
}

export async function embedWatermark(
  userId: string,
  recordingId: string,
  sessionId: string,
): Promise<{ watermarkedUrl: string }> {
  const timestamp = new Date().toISOString()
  const payload: WatermarkPayload = { userId, recordingId, sessionId, timestamp }
  const watermarkData = Buffer.from(JSON.stringify(payload)).toString('base64')

  const outputKey = `recordings/${recordingId}/watermarked/${sessionId}.mpd`

  try {
    const response = await fetch(VIDEOSEAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': VIDEOSEAL_API_KEY,
      },
      body: JSON.stringify({
        source_url: `recordings/${recordingId}/packaged/stream.mpd`,
        watermark_data: watermarkData,
        output_key: outputKey,
      }),
    })

    if (!response.ok) {
      throw new Error(`VideoSeal API error: ${response.status}`)
    }

    const result = await response.json() as { output_url: string }

    // Log this playback for forensic tracking
    await prisma.playbackLog.create({
      data: {
        recordingId,
        userId,
        sessionId,
        watermarkedUrl: result.output_url,
      },
    })

    return { watermarkedUrl: result.output_url }
  } catch (err) {
    console.warn('[watermark] VideoSeal failed, falling back to original URL:', err)
    return { watermarkedUrl: '' } // caller will use original URL on empty string
  }
}
