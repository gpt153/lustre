import type { FastifyInstance } from 'fastify'
import { handleMediaConvertComplete } from '../lib/drm.js'

export async function consentRoutes(fastify: FastifyInstance): Promise<void> {
  // MediaConvert SNS webhook — called when transcoding job completes
  fastify.post('/api/consent/mediaconvert-webhook', async (request, reply) => {
    const body = request.body as {
      Type?: string
      Message?: string
      SubscribeURL?: string
    }

    // Handle SNS subscription confirmation
    if (body?.Type === 'SubscriptionConfirmation' && body?.SubscribeURL) {
      await fetch(body.SubscribeURL)
      return reply.status(200).send({ ok: true })
    }

    // Handle notification
    if (body?.Type === 'Notification' && body?.Message) {
      try {
        const message = JSON.parse(body.Message) as {
          detail?: {
            status?: string
            jobId?: string
            outputGroupDetails?: Array<{
              outputDetails?: Array<{ outputFilePaths?: string[] }>
            }>
          }
          userMetadata?: { recordingId?: string }
        }

        if (message.detail?.status === 'COMPLETE' && message.userMetadata?.recordingId) {
          const recordingId = message.userMetadata.recordingId
          const outputKey =
            message.detail.outputGroupDetails?.[0]?.outputDetails?.[0]?.outputFilePaths?.[0] ?? ''
          await handleMediaConvertComplete(recordingId, outputKey)
        }
      } catch {
        // Invalid message — ignore
      }
    }

    return reply.status(200).send({ ok: true })
  })
}
