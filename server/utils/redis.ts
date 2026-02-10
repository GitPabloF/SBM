import redis from "@/server/config/redis"

export const CACHE_TTL = {
  BOOKMARKS: 900,
  BOOKMARK: 900,
} as const

export const redisUtils = {
  /**
   * Safe get - returns null if Redis fails
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const cached = await redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error)
      return null
    }
  },

  /**
   * Safe set - fails silently if Redis is down
   */
  set: async (
    key: string,
    value: unknown,
    ttl: number = CACHE_TTL.BOOKMARKS,
  ): Promise<boolean> => {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttl)
      return true
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error)
      return false
    }
  },

  /**
   * Safe delete - fails silently if Redis is down
   */
  del: async (key: string): Promise<boolean> => {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error)
      return false
    }
  },

  /**
   * Safe delete by pattern - fails silently if Redis is down
   */
  deleteKeysByPattern: async (pattern: string): Promise<number> => {
    try {
      let deletedCount = 0
      const stream = redis.scanStream({
        match: pattern,
        count: 100,
      })

      for await (const keys of stream) {
        if (keys.length) {
          await redis.del(...keys)
          deletedCount += keys.length
        }
      }
      return deletedCount
    } catch (error) {
      console.error(
        `Redis deleteKeysByPattern error for pattern ${pattern}:`,
        error,
      )
      return 0
    }
  },
}
