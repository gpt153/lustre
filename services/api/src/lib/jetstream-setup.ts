import { getJetStreamManager } from './nats.js'
import { RetentionPolicy } from 'nats'

const STREAMS = [
  {
    name: 'LUSTRE_MEDIA',
    subjects: ['lustre.media.>'],
    max_age: 7 * 24 * 60 * 60 * 1_000_000_000, // 7 days in nanoseconds
    max_bytes: 1024 * 1024 * 1024, // 1GB
  },
  {
    name: 'LUSTRE_SEARCH',
    subjects: ['lustre.search.>'],
    max_age: 7 * 24 * 60 * 60 * 1_000_000_000,
    max_bytes: 1024 * 1024 * 1024,
  },
]

export async function ensureStreams(): Promise<void> {
  const jsm = await getJetStreamManager()

  for (const stream of STREAMS) {
    try {
      await jsm.streams.info(stream.name)
      // Stream exists — update mutable fields (retention is immutable after creation)
      await jsm.streams.update(stream.name, {
        subjects: stream.subjects,
        max_age: stream.max_age,
        max_bytes: stream.max_bytes,
      })
    } catch {
      // Stream doesn't exist, create it
      await jsm.streams.add({
        name: stream.name,
        subjects: stream.subjects,
        retention: RetentionPolicy.Limits,
        max_age: stream.max_age,
        max_bytes: stream.max_bytes,
      })
    }
  }
}
