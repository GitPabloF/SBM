import { validate } from "@/server/middleware/validate"
import { loginSchema } from "@/server/validation/auth.schema"
import authService from "@/server/services/auth.service"
import { createAccessToken, createRefreshToken } from "@/server/utils/jwt.utile"
import { connectDatabase } from "@/server/config/database"
import { checkRateLimit } from "@/server/middleware/apiLimitre"
import { NextResponse } from "next/server"
import { accessCookieOptions, refreshCookieOptions, isProd } from "@/server/utils/cookies"


/**
 * Handle user login requests. Validates the request body, checks user credentials, and returns access and refresh tokens if successful.
 * @param request
 * @returns
 */
export async function POST(request: Request) {
  try {
    // Limit to 10 requests per 15 minutes to prevent brute-force attacks
    const limited = await checkRateLimit(request, {
      windowMs: 15 * 60 * 1000,
      max: 10,
    })
    if (limited) return limited

    const body = await request.json()

    // validate the request body
    const validation = validate(loginSchema, body)
    if (!validation.success) return validation.response

    const { email, password } = validation.data

    await connectDatabase()

    const user = await authService.validateUser(email, password)
    const accessToken = createAccessToken({
      id: user._id.toString(),
      email: user.email,
    })
    const refreshToken = createRefreshToken({
      id: user._id.toString(),
      email: user.email,
    })

    const res = NextResponse.json({
      success: true,
      message: "Login successful",
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      ...(isProd ? {} : { accessToken, refreshToken }), // only include access and refresh tokens in non-production environment
    })

    // cookies httpOnly
    res.cookies.set("accessToken", accessToken, accessCookieOptions)
    res.cookies.set("refreshToken", refreshToken, refreshCookieOptions)

    return res
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message === "USER_NOT_FOUND" || message === "PASSWORD_INCORRECT") {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 },
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
