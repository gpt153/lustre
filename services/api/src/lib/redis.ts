import Redis from 'ioredis'

let redis: Redis

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined
}

if (!global.__redis) {
  const sentinelHosts = process.env.REDIS_SENTINEL_HOSTS
  if (sentinelHosts) {
    // Sentinel mode: REDIS_SENTINEL_HOSTS="host1:26379,host2:26379,host3:26379"
    const sentinels = sentinelHosts.split(',').map((h) => {
      const [host, port] = h.trim().split(':')
      return { host: host!, port: Number(port) || 26379 }
    })
    global.__redis = new Redis({
      sentinels,
      name: process.env.REDIS_SENTINEL_MASTER || 'mymaster',
      sentinelPassword: process.env.REDIS_SENTINEL_PASSWORD || undefined,
      password: process.env.REDIS_PASSWORD || undefined,
    })
  } else {
    global.__redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
  }
}
redis = global.__redis

export { redis }
