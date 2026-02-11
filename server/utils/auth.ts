import ms, { type StringValue } from "ms"

const accessTtl = (process.env.AUTH_ACCESS_TTL ?? "15m") as StringValue
const refreshTtl = (process.env.AUTH_REFRESH_TTL ?? "14d") as StringValue

const toSeconds = (ttl: StringValue) => Math.floor(ms(ttl) / 1000)

export const authTtl = {
    access: { jwt: accessTtl, cookieMaxAge: toSeconds(accessTtl) },
    refresh: { jwt: refreshTtl, cookieMaxAge: toSeconds(refreshTtl) },
}
