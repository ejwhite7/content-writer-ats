import { Redis } from 'redis'

let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL
    
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set')
    }

    redis = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })

    redis.on('error', (error) => {
      console.error('Redis error:', error)
    })

    redis.on('connect', () => {
      console.log('Connected to Redis')
    })

    redis.on('disconnect', () => {
      console.log('Disconnected from Redis')
    })
  }

  return redis
}

// Graceful shutdown
export async function disconnectRedis() {
  if (redis) {
    await redis.quit()
    redis = null
  }
}

// Health check
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = getRedisClient()
    const result = await client.ping()
    return result === 'PONG'
  } catch (error) {
    console.error('Redis health check failed:', error)
    return false
  }
}