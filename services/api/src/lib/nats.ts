import { connect, NatsConnection, JetStreamManager, JetStreamClient } from 'nats'

let nc: NatsConnection | null = null
let jsm: JetStreamManager | null = null
let js: JetStreamClient | null = null

export async function getNatsConnection(): Promise<NatsConnection> {
  if (!nc || nc.isClosed()) {
    nc = await connect({
      servers: process.env.NATS_URL || 'nats://localhost:4222',
      reconnectDelayHandler: () => {
        // Exponential backoff: 250ms → 500ms → 1s → ... → 30s max, with ±25% jitter
        const base = Math.min(250 * Math.pow(2, Math.random() * 7), 30_000)
        const jitter = base * (0.75 + Math.random() * 0.5)
        return jitter
      },
      maxReconnectAttempts: -1, // Unlimited reconnect attempts
    })
  }
  return nc
}

export async function getJetStream(): Promise<JetStreamClient> {
  if (!js) {
    const conn = await getNatsConnection()
    js = conn.jetstream()
  }
  return js
}

export async function getJetStreamManager(): Promise<JetStreamManager> {
  if (!jsm) {
    const conn = await getNatsConnection()
    jsm = await conn.jetstreamManager()
  }
  return jsm
}

export async function closeNats(): Promise<void> {
  if (nc && !nc.isClosed()) {
    await nc.close()
    nc = null
    js = null
    jsm = null
  }
}
