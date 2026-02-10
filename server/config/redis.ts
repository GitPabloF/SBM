import Redis from 'ioredis'

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || 'changeme123',
    retryStrategy: (times) => {
        // Stop retrying after 3 attempts
        if (times > 3) {
            return null
        }
        return Math.min(times * 50, 2000) // retry every 50ms up to 2s
    },
})

redis.on('connect', () => {
    console.log("Redis connected")
})

redis.on('error', (error) => {
    console.error('Redis error', error)
})


export default redis 