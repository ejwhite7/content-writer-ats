import { createClient } from 'redis'

type RedisClientType = ReturnType<typeof createClient>

let redis: RedisClientType | null = null

export function getRedisClient(): RedisClientType {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL
    
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set')
    }

    redis = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    })

    redis.on('error', (error: Error) => {
      console.error('Redis error:', error)
    })

    redis.on('connect', () => {
      console.log('Connected to Redis')
    })

    redis.on('end', () => {
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