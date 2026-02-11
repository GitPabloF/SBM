import authService from "@/server/services/auth.service"
import { connectDatabase } from "@/server/config/database"
import { accessCookieOptions, getCookieValue, refreshCookieOptions, isProd } from "@/server/utils/cookies";
import { checkRateLimit } from "@/server/middleware/apiLimitre"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Limit to 30 requests per 15 minutes to prevent abuse
    const limited = await checkRateLimit(request, {
      windowMs: 15 * 60 * 1000,
      max: 30,
    })
    if (limited) return limited

    const refreshToken = getCookieValue(request, "refreshToken")


    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "You should provide a refresh token" },
        { status: 400 },
      )
    }

    await connectDatabase()

    const accessToken = await authService.refreshAccessToken(refreshToken)

    const res = NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      ...(isProd ? {} : { accessToken }),
    })

    res.cookies.set("accessToken", accessToken, accessCookieOptions)
    res.cookies.set("refreshToken", refreshToken, refreshCookieOptions)

    return res
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message === "NO_REFRESH_TOKEN" || message === "INVALID_REFRESH_TOKEN") {
      return NextResponse.json(
        { success: false, error: "Invalid refresh token" },
        { status: 401 },
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
