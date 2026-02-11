import { checkRateLimit } from "@/server/middleware/apiLimitre"
import { clearCookieOptions } from "@/server/utils/cookies"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const limited = await checkRateLimit(request)
    if (limited) return limited

    const res = NextResponse.json({
      success: true,
      message: "Logout successful",
    })

    res.cookies.set("accessToken", "", clearCookieOptions)
    res.cookies.set("refreshToken", "", clearCookieOptions)

    return res
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
