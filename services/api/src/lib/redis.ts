import Redis from 'ioredis'

let redis: Redis

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined
}

if (!global.__redis) {
  global.__redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
}
redis = global.__redis

export { redis }
