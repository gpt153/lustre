import { connect, NatsConnection, JetStreamManager, JetStreamClient } from 'nats'

let nc: NatsConnection | null = null
let jsm: JetStreamManager | null = null
let js: JetStreamClient | null = null

export async function getNatsConnection(): Promise<NatsConnection> {
  if (!nc || nc.isClosed()) {
    nc = await connect({
      servers: process.env.NATS_URL || 'nats://localhost:4222',
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
