import { authTtl } from "./auth"

export const isProd = process.env.NODE_ENV === "production"

export const accessCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: authTtl.access.cookieMaxAge
}

export const refreshCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: authTtl.refresh.cookieMaxAge
}


export const clearCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
}

/**
 * Read a cookie value from the request Cookie header.
 */
export const getCookieValue = (request: Request, name: string) => {
    const cookieHeader = request.headers.get("cookie")
    if (!cookieHeader) return null

    const prefix = `${name}=`
    const pair = cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(prefix))

    if (!pair) return null

    const value = pair.slice(prefix.length)
    try {
        return decodeURIComponent(value)
    } catch {
        return value
    }
}
