import { NextResponse } from "next/server"
import redis from "@/server/config/redis"

interface RateLimitOptions {
  windowMs: number
  max: number
}

/**
 * Check rate limit for a given IP address using Redis sliding window.
 * Returns a NextResponse with 429 status if limit is exceeded, or null if allowed.
 */
export async function checkRateLimit(
  request: Request,
  options: RateLimitOptions = { windowMs: 15 * 60 * 1000, max: 100 },
): Promise<NextResponse | null> {
  if (process.env.NODE_ENV === "development") {
    return null // Skip rate limiting in development
  }
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"

  const key = `rate-limit:${ip}`
  const now = Date.now()
  const windowStart = now - options.windowMs

  // Remove expired entries and count + add current request atomically
  const multi = redis.multi()
  multi.zremrangebyscore(key, 0, windowStart)
  multi.zadd(key, now, `${now}`)
  multi.zcard(key)
  multi.pexpire(key, options.windowMs)

  const results = await multi.exec()
  const requestCount = results?.[2]?.[1] as number

  if (requestCount > options.max) {
    return NextResponse.json(
      { success: false, error: "Too many requests, please try again later." },
      { status: 429 },
    )
  }

  return null
}
