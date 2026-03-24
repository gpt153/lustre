import { getJetStream, getJetStreamManager } from './nats.js'
import { StringCodec } from 'nats'

const sc = StringCodec()

const STREAM_NAME = 'LUSTRE'
const SUBJECTS = ['lustre.>']

export async function ensureStream(): Promise<void> {
  const jsm = await getJetStreamManager()
  try {
    await jsm.streams.info(STREAM_NAME)
  } catch {
    await jsm.streams.add({
      name: STREAM_NAME,
      subjects: SUBJECTS,
    })
  }
}

export async function publishEvent(subject: string, data: Record<string, unknown>): Promise<void> {
  const js = await getJetStream()
  await js.publish(subject, sc.encode(JSON.stringify(data)))
}
